const mongoose = require('mongoose');
const dotenv   = require('dotenv');
dotenv.config({ path: './.env' });

const CourseSchema = new mongoose.Schema({
  code:        { type: String, required: true, unique: true },
  name:        { type: String, required: true },
  category:    { type: String },
}, { timestamps: true });

const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema);

const courses = [
  // Core
  { code: 'CS 5010', name: 'Programming Design Paradigm',            category: 'Core' },
  { code: 'CS 5800', name: 'Algorithms',                             category: 'Core' },

  // AI & Data Science
  { code: 'CS 5100', name: 'Foundations of Artificial Intelligence', category: 'AI & Data Science' },
  { code: 'CS 5200', name: 'Database Management Systems',            category: 'AI & Data Science' },
  { code: 'CS 5330', name: 'Pattern Recognition and Computer Vision',category: 'AI & Data Science' },
  { code: 'CS 6120', name: 'Natural Language Processing',            category: 'AI & Data Science' },
  { code: 'CS 6140', name: 'Machine Learning',                       category: 'AI & Data Science' },
  { code: 'CS 6220', name: 'Data Mining Techniques',                 category: 'AI & Data Science' },
  { code: 'CS 7150', name: 'Deep Learning',                          category: 'AI & Data Science' },

  // Systems & Software
  { code: 'CS 5400', name: 'Principles of Programming Language',     category: 'Systems & Software' },
  { code: 'CS 5500', name: 'Foundations of Software Engineering',    category: 'Systems & Software' },
  { code: 'CS 5600', name: 'Computer Systems',                       category: 'Systems & Software' },
  { code: 'CS 5610', name: 'Web Development',                        category: 'Systems & Software' },
  { code: 'CS 5700', name: 'Fundamentals of Computer Networking',    category: 'Systems & Software' },
  { code: 'CS 6620', name: 'Fundamentals of Cloud Computing',        category: 'Systems & Software' },
  { code: 'CS 6650', name: 'Building Scalable Distributed Systems',  category: 'Systems & Software' },

  // Security
  { code: 'CS 6760', name: 'Privacy, Security, and Usability',       category: 'Theory & Security' },
  { code: 'CY 5770', name: 'Software Vulnerabilities and Security',  category: 'Theory & Security' },
  { code: 'CY 6740', name: 'Network Security',                       category: 'Theory & Security' },

  // Theory & Algorithms
  { code: 'CS 7800', name: 'Advanced Algorithms',                    category: 'Theory & Security' },
  { code: 'CS 7805', name: 'Complexity Theory',                      category: 'Theory & Security' },
  { code: 'CS 7810', name: 'Foundations of Cryptography',            category: 'Theory & Security' },

  // Human-Computer Interaction
  { code: 'CS 5340', name: 'Computer/Human Interaction',             category: 'HCI' },
  { code: 'CS 7300', name: 'Empirical Research Methods for Human Computer Interaction', category: 'HCI' },
  { code: 'CS 7340', name: 'Theory and Methods in Human Computer Interaction', category: 'HCI' },

  // Graphics & Vision
  { code: 'CS 5310', name: 'Computer Graphics',                      category: 'Graphics & Vision' },
  { code: 'CS 5520', name: 'Mobile Application Development',         category: 'Systems & Software' },
  { code: 'CS 5850', name: 'Building Game Engines',                  category: 'Graphics & Vision' },
  { code: 'CS 6200', name: 'Information Retrieval',                  category: 'AI & Data Science' },
  { code: 'CS 6240', name: 'Large-Scale Parallel Data Processing',   category: 'AI & Data Science' },
  { code: 'CS 6410', name: 'Compilers',                              category: 'Systems & Software' },
  { code: 'CS 6510', name: 'Advanced Software Development',          category: 'Systems & Software' },
  { code: 'CS 6640', name: 'Operating Systems Implementation',       category: 'Systems & Software' },
  { code: 'CS 7200', name: 'Statistical Methods for Computer Science', category: 'AI & Data Science' },
  { code: 'CS 7610', name: 'Foundations of Distributed Systems',     category: 'Systems & Software' },

  // Data Science
  { code: 'DS 5110', name: 'Essentials of Data Science',             category: 'Data Science' },
  { code: 'DS 5230', name: 'Unsupervised Machine Learning and Data Mining', category: 'Data Science' },

  // Cybersecurity
  { code: 'CY 5001', name: 'Cybersecurity: Technologies, Threats, and Defenses', category: 'Theory & Security' },
  { code: 'CY 5010', name: 'Cybersecurity Principles and Practices', category: 'Theory & Security' },
  { code: 'CY 5130', name: 'Computer System Security',               category: 'Theory & Security' },
  { code: 'CY 6120', name: 'Software Security Practices',            category: 'Theory & Security' },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected');

  let inserted = 0;
  let skipped  = 0;

  for (const c of courses) {
    const exists = await Course.findOne({ code: c.code });
    if (exists) {
      console.log(`Skipped (already exists): ${c.code}`);
      skipped++;
    } else {
      await Course.create(c);
      console.log(`Inserted: ${c.code} — ${c.name}`);
      inserted++;
    }
  }

  console.log(`\nDone. ${inserted} inserted, ${skipped} skipped.`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});