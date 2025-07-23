// Initialize Stripe with error handling
let stripe;
try {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (
    !stripeSecretKey ||
    stripeSecretKey === "sk_test_your_stripe_secret_key_here"
  ) {
    console.warn(
      "Warning: STRIPE_SECRET_KEY is not properly configured. Payment functionality will be disabled."
    );
    stripe = null;
  } else {
    stripe = require("stripe")(stripeSecretKey);
    console.log("Stripe initialized successfully");
  }
} catch (error) {
  console.error("Failed to initialize Stripe:", error);
  stripe = null;
}

const Appointment = require("../models/Appointment");
const {
  createAppointmentNotification,
} = require("../services/notificationService");

const paymentController = {
  // Create payment intent
  createPaymentIntent: async (req, res) => {
    try {
      // Check if Stripe is properly configured
      if (!stripe) {
        return res.status(503).json({
          message:
            "Payment service is not configured. Please set up Stripe API keys.",
          error: "STRIPE_NOT_CONFIGURED",
        });
      }

      const { amount, currency = "usd", appointmentData } = req.body;

      // Validate required fields
      if (!amount || amount <= 0) {
        return res.status(400).json({
          message: "Invalid amount provided",
          error: "INVALID_AMOUNT",
        });
      }

      // Create a PaymentIntent with the order amount and currency
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe expects amount in cents
        currency: currency,
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          doctorId: appointmentData.doctorId,
          appointmentId: appointmentData.appointmentId || "",
          patientName: appointmentData.patientName || "",
          patientEmail: appointmentData.patientEmail || "",
          appointmentDate: appointmentData.appointmentDate || "",
          department: appointmentData.department || "",
        },
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      });
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({
        message: "Failed to create payment intent",
        error: error.message,
      });
    }
  },

  // Verify payment status
  verifyPayment: async (req, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({
          message: "Payment service is not configured",
          error: "STRIPE_NOT_CONFIGURED",
        });
      }

      const { paymentIntentId } = req.body;

      // Retrieve payment intent from Stripe
      const paymentIntent =
        await stripe.paymentIntents.retrieve(paymentIntentId);

      res.json({
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        metadata: paymentIntent.metadata,
      });
    } catch (error) {
      console.error("Error verifying payment:", error);
      res.status(500).json({
        message: "Failed to verify payment",
        error: error.message,
      });
    }
  },

  // Handle Stripe webhook
  handleWebhook: async (req, res) => {
    if (!stripe) {
      return res.status(503).json({
        message: "Payment service is not configured",
        error: "STRIPE_NOT_CONFIGURED",
      });
    }

    const sig = req.headers["stripe-signature"];
    let event;

    try {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      if (
        !webhookSecret ||
        webhookSecret === "whsec_your_webhook_secret_here"
      ) {
        console.warn(
          "Warning: STRIPE_WEBHOOK_SECRET not configured. Skipping webhook verification."
        );
        // For development, we can parse the event without verification
        event = req.body;
      } else {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      }
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        console.log("Payment succeeded:", paymentIntent.id);

        // Update appointment payment status
        if (paymentIntent.metadata.appointmentId) {
          try {
            const updatedAppointment = await Appointment.findByIdAndUpdate(
              paymentIntent.metadata.appointmentId,
              {
                paymentStatus: "completed",
                paymentIntentId: paymentIntent.id,
                paymentAmount: paymentIntent.amount / 100,
                status: "CONFIRMED",
              },
              { new: true }
            );

            // Now send notification to doctor since payment is completed
            if (updatedAppointment) {
              try {
                await createAppointmentNotification(
                  updatedAppointment.doctorId,
                  updatedAppointment
                );

                // Emit real-time notification to doctor
                if (req.app.get("io")) {
                  const io = req.app.get("io");
                  io.to(`doctor-${updatedAppointment.doctorId}`).emit(
                    "new-appointment-notification",
                    {
                      type: "APPOINTMENT_PAID",
                      message: `Payment completed for appointment by ${updatedAppointment.patientInfo.name}`,
                      appointment: updatedAppointment,
                      timestamp: new Date(),
                    }
                  );
                }

                console.log(
                  `Notification sent to doctor ${updatedAppointment.doctorId} after payment success`
                );
              } catch (notificationError) {
                console.error(
                  "Failed to create payment completion notification:",
                  notificationError
                );
              }
            }
          } catch (updateError) {
            console.error("Error updating appointment:", updateError);
          }
        }
        break;

      case "payment_intent.payment_failed":
        const failedPayment = event.data.object;
        console.log("Payment failed:", failedPayment.id);

        // Update appointment payment status
        if (failedPayment.metadata.appointmentId) {
          try {
            await Appointment.findByIdAndUpdate(
              failedPayment.metadata.appointmentId,
              {
                paymentStatus: "failed",
                status: "CANCELLED",
              }
            );
          } catch (updateError) {
            console.error("Error updating failed payment:", updateError);
          }
        }
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  },

  // Update payment status manually
  updatePaymentStatus: async (req, res) => {
    try {
      const { appointmentId, paymentStatus, paymentIntentId, paymentAmount } =
        req.body;

      const updateData = {
        paymentStatus,
        updatedAt: new Date(),
      };

      if (paymentIntentId) {
        updateData.paymentIntentId = paymentIntentId;
      }

      if (paymentAmount) {
        updateData.paymentAmount = paymentAmount;
      }

      if (paymentStatus === "completed") {
        updateData.status = "CONFIRMED";
      } else if (paymentStatus === "failed") {
        updateData.status = "CANCELLED";
      }

      const updatedAppointment = await Appointment.findByIdAndUpdate(
        appointmentId,
        updateData,
        { new: true, runValidators: true }
      );

      if (!updatedAppointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }

      // Send notification to doctor if payment is completed
      if (paymentStatus === "completed") {
        try {
          await createAppointmentNotification(
            updatedAppointment.doctorId,
            updatedAppointment
          );

          // Emit real-time notification to doctor
          if (req.app.get("io")) {
            const io = req.app.get("io");
            io.to(`doctor-${updatedAppointment.doctorId}`).emit(
              "new-appointment-notification",
              {
                type: "APPOINTMENT_PAID",
                message: `Payment completed for appointment by ${updatedAppointment.patientInfo.name}`,
                appointment: updatedAppointment,
                timestamp: new Date(),
              }
            );
          }

          console.log(
            `Notification sent to doctor ${updatedAppointment.doctorId} after manual payment update`
          );
        } catch (notificationError) {
          console.error(
            "Failed to create payment completion notification:",
            notificationError
          );
        }
      }

      res.json({
        message: "Payment status updated successfully",
        appointment: updatedAppointment,
      });
    } catch (error) {
      console.error("Error updating payment status:", error);
      res.status(500).json({
        message: "Failed to update payment status",
        error: error.message,
      });
    }
  },
};

module.exports = paymentController;
