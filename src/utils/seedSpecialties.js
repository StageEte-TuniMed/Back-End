const mongoose = require("mongoose");
const Specialty = require("../models/Specialty");
const config = require("../config/config");
require("dotenv").config();

const specialtiesData = [
  // Main Specialties
  { name: "Cardiologue", category: "MAIN", sortOrder: 1 },
  { name: "Chirurgien Esthétique", category: "MAIN", sortOrder: 2 },
  {
    name: "Chirurgien Orthopédiste Traumatologue",
    category: "MAIN",
    sortOrder: 3,
  },
  { name: "Dentiste", category: "MAIN", sortOrder: 4 },
  { name: "Dermatologue", category: "MAIN", sortOrder: 5 },
  { name: "Endocrinologue Diabétologue", category: "MAIN", sortOrder: 6 },
  { name: "Gastro-entérologue", category: "MAIN", sortOrder: 7 },
  { name: "Généraliste", category: "MAIN", sortOrder: 8 },
  { name: "Gynécologue Obstétricien", category: "MAIN", sortOrder: 9 },
  { name: "Interniste", category: "MAIN", sortOrder: 10 },
  {
    name: "Laboratoire d'analyses de biologie médicale",
    category: "MAIN",
    sortOrder: 11,
  },
  { name: "Néphrologue", category: "MAIN", sortOrder: 12 },
  { name: "Neurologue", category: "MAIN", sortOrder: 13 },
  { name: "Nutritionniste", category: "MAIN", sortOrder: 14 },
  { name: "Ophtalmologiste", category: "MAIN", sortOrder: 15 },
  { name: "Oto-Rhino-Laryngologiste (ORL)", category: "MAIN", sortOrder: 16 },
  { name: "Pédiatre", category: "MAIN", sortOrder: 17 },
  { name: "Pneumologue", category: "MAIN", sortOrder: 18 },
  { name: "Psychiatre", category: "MAIN", sortOrder: 19 },
  { name: "Psychothérapeute", category: "MAIN", sortOrder: 20 },
  { name: "Radiologue", category: "MAIN", sortOrder: 21 },
  { name: "Rhumatologue", category: "MAIN", sortOrder: 22 },
  { name: "Sexologue", category: "MAIN", sortOrder: 23 },
  { name: "Urologue", category: "MAIN", sortOrder: 24 },

  // Other Specialties
  { name: "Acupuncture", category: "OTHER", sortOrder: 100 },
  { name: "Addictologue", category: "OTHER", sortOrder: 101 },
  { name: "Algologue", category: "OTHER", sortOrder: 102 },
  { name: "Allergologue", category: "OTHER", sortOrder: 103 },
  { name: "Anatomo-Cyto-Pathologiste", category: "OTHER", sortOrder: 104 },
  { name: "Andrologue", category: "OTHER", sortOrder: 105 },
  { name: "Anesthésiste-Réanimateur", category: "OTHER", sortOrder: 106 },
  { name: "Angiologue", category: "OTHER", sortOrder: 107 },
  { name: "Audiologiste", category: "OTHER", sortOrder: 108 },
  { name: "Audioprothésiste", category: "OTHER", sortOrder: 109 },
  { name: "Auriculothérapeute", category: "OTHER", sortOrder: 110 },
  { name: "Biochimiste", category: "OTHER", sortOrder: 111 },
  { name: "Biochimiste Clinique", category: "OTHER", sortOrder: 112 },
  { name: "Biologiste Medicale", category: "OTHER", sortOrder: 113 },
  { name: "Biophysique", category: "OTHER", sortOrder: 114 },
  { name: "Cancérologue", category: "OTHER", sortOrder: 115 },
  { name: "Cardiologue pédiatrique", category: "OTHER", sortOrder: 116 },
  { name: "Centre d'imagerie médicale", category: "OTHER", sortOrder: 117 },
  { name: "Chiropracteur", category: "OTHER", sortOrder: 118 },
  {
    name: "Chirurgie Arthroscopique et du Sport",
    category: "OTHER",
    sortOrder: 119,
  },
  {
    name: "Chirurgie plastique et réparatrice",
    category: "OTHER",
    sortOrder: 120,
  },
  { name: "Chirurgien", category: "OTHER", sortOrder: 121 },
  { name: "Chirurgien Buccal", category: "OTHER", sortOrder: 122 },
  { name: "Chirurgien Cancérologue", category: "OTHER", sortOrder: 123 },
  { name: "Chirurgien capillaire", category: "OTHER", sortOrder: 124 },
  { name: "Chirurgien Cardio-Vasculaire", category: "OTHER", sortOrder: 125 },
  {
    name: "Chirurgien Cardio-Vasculaire Thoracique",
    category: "OTHER",
    sortOrder: 126,
  },
  { name: "Chirurgien cervico-facial", category: "OTHER", sortOrder: 127 },
  { name: "Chirurgien de l'obésité", category: "OTHER", sortOrder: 128 },
  { name: "Chirurgien Généraliste", category: "OTHER", sortOrder: 129 },
  {
    name: "Chirurgien Maxillo Facial et Esthétique",
    category: "OTHER",
    sortOrder: 130,
  },
  {
    name: "Chirurgien Maxillo Facial Stomatologue",
    category: "OTHER",
    sortOrder: 131,
  },
  {
    name: "Chirurgien Orthopédiste Pédiatrique",
    category: "OTHER",
    sortOrder: 132,
  },
  { name: "Chirurgien Pédiatrique", category: "OTHER", sortOrder: 133 },
  { name: "Chirurgien Plasticien", category: "OTHER", sortOrder: 134 },
  { name: "Chirurgien Thoracique", category: "OTHER", sortOrder: 135 },
  { name: "Chirurgien Urologue", category: "OTHER", sortOrder: 136 },
  { name: "Chirurgien vasculaire", category: "OTHER", sortOrder: 137 },
  {
    name: "Chirurgien viscéral et digestif",
    category: "OTHER",
    sortOrder: 138,
  },
  { name: "Diabétologue", category: "OTHER", sortOrder: 139 },
  { name: "Diététicien", category: "OTHER", sortOrder: 140 },
  { name: "Embryologiste", category: "OTHER", sortOrder: 141 },
  { name: "Endocrinologue", category: "OTHER", sortOrder: 142 },
  { name: "Endodontiste", category: "OTHER", sortOrder: 143 },
  { name: "Epidemiologiste", category: "OTHER", sortOrder: 144 },
  { name: "Ergothérapeute", category: "OTHER", sortOrder: 145 },
  { name: "Généticien", category: "OTHER", sortOrder: 146 },
  { name: "Gériatre", category: "OTHER", sortOrder: 147 },
  { name: "Hématologue", category: "OTHER", sortOrder: 148 },
  { name: "Hématologue Clinique", category: "OTHER", sortOrder: 149 },
  { name: "Hématopathologiste", category: "OTHER", sortOrder: 150 },
  { name: "Hépatologue", category: "OTHER", sortOrder: 151 },
  { name: "Hypnothérapeute", category: "OTHER", sortOrder: 152 },
  { name: "Imagerie Médicale", category: "OTHER", sortOrder: 153 },
  { name: "Immunologiste", category: "OTHER", sortOrder: 154 },
  { name: "Immunopathologiste", category: "OTHER", sortOrder: 155 },
  { name: "Implantologue", category: "OTHER", sortOrder: 156 },
  { name: "Infirmier", category: "OTHER", sortOrder: 157 },
  { name: "Interniste Hypertensiologue", category: "OTHER", sortOrder: 158 },
  {
    name: "Interniste Maladies Infectieuses",
    category: "OTHER",
    sortOrder: 159,
  },
  {
    name: "Interniste Réanimation Médicale",
    category: "OTHER",
    sortOrder: 160,
  },
  { name: "Kinésithérapeute", category: "OTHER", sortOrder: 161 },
  {
    name: "Laboratoire d'anatomie et cytologie pathologiques",
    category: "OTHER",
    sortOrder: 162,
  },
  { name: "Laboratoire de cytogénétique", category: "OTHER", sortOrder: 163 },
  { name: "Maladies Cardiovasculaire", category: "OTHER", sortOrder: 164 },
  { name: "Maladies Infectieuses", category: "OTHER", sortOrder: 165 },
  { name: "Médecin Biologiste", category: "OTHER", sortOrder: 166 },
  { name: "Médecin de famille", category: "OTHER", sortOrder: 167 },
  { name: "Médecin du sommeil", category: "OTHER", sortOrder: 168 },
  { name: "Médecin du sport", category: "OTHER", sortOrder: 169 },
  { name: "Médecin du Travail", category: "OTHER", sortOrder: 170 },
  { name: "Médecin Esthétique", category: "OTHER", sortOrder: 171 },
  { name: "Médecin Hémodialyseur", category: "OTHER", sortOrder: 172 },
  { name: "Médecin homéopathe", category: "OTHER", sortOrder: 173 },
  { name: "Médecin Légiste", category: "OTHER", sortOrder: 174 },
  { name: "Médecin Nucléaire", category: "OTHER", sortOrder: 175 },
  { name: "Médecin Physique Réadaptateur", category: "OTHER", sortOrder: 176 },
  { name: "Médecin urgentiste", category: "OTHER", sortOrder: 177 },
  { name: "Médecine douce et alternative", category: "OTHER", sortOrder: 178 },
  {
    name: "Médecine morphologique et anti-âge",
    category: "OTHER",
    sortOrder: 179,
  },
  { name: "Médecine Préventive", category: "OTHER", sortOrder: 180 },
  { name: "Médecine tropicale", category: "OTHER", sortOrder: 181 },
  { name: "Microbiologiste", category: "OTHER", sortOrder: 182 },
  { name: "Néonatologiste", category: "OTHER", sortOrder: 183 },
  { name: "Neurochirurgien", category: "OTHER", sortOrder: 184 },
  { name: "Neuropédiatre", category: "OTHER", sortOrder: 185 },
  { name: "Neurophysiologiste", category: "OTHER", sortOrder: 186 },
  { name: "Neuropsychiatre", category: "OTHER", sortOrder: 187 },
  { name: "Neuropsychologue", category: "OTHER", sortOrder: 188 },
  { name: "Nutrithérapeute", category: "OTHER", sortOrder: 189 },
  { name: "Oncologue", category: "OTHER", sortOrder: 190 },
  { name: "Oncologue-Chimiothérapeute", category: "OTHER", sortOrder: 191 },
  { name: "Oncologue-Radiothérapeute", category: "OTHER", sortOrder: 192 },
  { name: "Opticien", category: "OTHER", sortOrder: 193 },
  { name: "Orthodontiste", category: "OTHER", sortOrder: 194 },
  { name: "Orthophoniste", category: "OTHER", sortOrder: 195 },
  { name: "Orthoprothésiste", category: "OTHER", sortOrder: 196 },
  { name: "Orthoptiste", category: "OTHER", sortOrder: 197 },
  { name: "Ostéopathe", category: "OTHER", sortOrder: 198 },
  { name: "Parasitologiste", category: "OTHER", sortOrder: 199 },
  { name: "Parodontiste implantologiste", category: "OTHER", sortOrder: 200 },
  { name: "Pédodontiste", category: "OTHER", sortOrder: 201 },
  { name: "Pédopsychiatre", category: "OTHER", sortOrder: 202 },
  { name: "Perineologue", category: "OTHER", sortOrder: 203 },
  { name: "Pharmacien", category: "OTHER", sortOrder: 204 },
  { name: "Pharmacien Biologiste", category: "OTHER", sortOrder: 205 },
  { name: "Pharmacologue", category: "OTHER", sortOrder: 206 },
  { name: "Phlébologue", category: "OTHER", sortOrder: 207 },
  { name: "Physiologiste", category: "OTHER", sortOrder: 208 },
  { name: "Physiothérapeute", category: "OTHER", sortOrder: 209 },
  { name: "Phytothérapeute", category: "OTHER", sortOrder: 210 },
  { name: "Podologue", category: "OTHER", sortOrder: 211 },
  { name: "Posturologue", category: "OTHER", sortOrder: 212 },
  { name: "Proctologue", category: "OTHER", sortOrder: 213 },
  { name: "Prothésiste Capillaire", category: "OTHER", sortOrder: 214 },
  { name: "Prothésiste dentaire", category: "OTHER", sortOrder: 215 },
  { name: "Psychanalyste", category: "OTHER", sortOrder: 216 },
  { name: "Psychologue", category: "OTHER", sortOrder: 217 },
  { name: "Psychologue clinicien", category: "OTHER", sortOrder: 218 },
  { name: "Psychomotricien", category: "OTHER", sortOrder: 219 },
  { name: "Radiothérapeute", category: "OTHER", sortOrder: 220 },
  { name: "Réanimateur Médical", category: "OTHER", sortOrder: 221 },
  { name: "Réflexologue", category: "OTHER", sortOrder: 222 },
  { name: "Rythmologue interventionnel", category: "OTHER", sortOrder: 223 },
  { name: "Sage femme", category: "OTHER", sortOrder: 224 },
  {
    name: "Santé publique et médecine sociale",
    category: "OTHER",
    sortOrder: 225,
  },
  { name: "Sénologue", category: "OTHER", sortOrder: 226 },
  { name: "Stomatologue", category: "OTHER", sortOrder: 227 },
  { name: "Thérapeute manuel", category: "OTHER", sortOrder: 228 },
  { name: "Urodynamique", category: "OTHER", sortOrder: 229 },
  { name: "Vétérinaire", category: "OTHER", sortOrder: 230 },
];

const seedSpecialties = async () => {
  try {
    // Connect to MongoDB using the same config as the main app
    await mongoose.connect(config.mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    // Clear existing specialties
    await Specialty.deleteMany({});
    console.log("Cleared existing specialties");

    // Insert new specialties
    const result = await Specialty.insertMany(specialtiesData);
    console.log(`Inserted ${result.length} specialties`);

    console.log("Specialties seeded successfully!");
  } catch (error) {
    console.error("Error seeding specialties:", error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
};

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedSpecialties();
}

module.exports = { seedSpecialties, specialtiesData };
