export const profile = {
  name: 'Abhinav I',
  email: 'abhinavi.2023@gmail.com',
  github: 'Ak-oo7',
  githubUrl: 'https://github.com/akverse02',
  linkedin: 'https://www.linkedin.com/in/abhinav-i-b47618354/?isSelfProfile=true',
  resume: '/resume.pdf',
}

export const filters = [
  { id: 'all', label: 'All' },
  { id: 'genai', label: 'GenAI' },
  { id: 'cv', label: 'Computer vision' },
  { id: 'ml', label: 'Machine learning' },
  { id: 'data', label: 'Data analysis' },
]

export const projects = [
  {
    title: 'LAWLLAMA',
    cat: ['genai'],
    label: 'GenAI and RAG',
    img: '/screenshots/lawllama.jpg',
    alt: 'LAWLLAMA legal assistant interface',
    desc: 'An AI legal assistant that answers legal questions with retrieval-augmented generation. It combines FAISS retrieval, BART and Llama 3 (through the Groq API) behind a Flask app.',
    tags: ['Python', 'Flask', 'FAISS', 'Transformers', 'Groq', 'Llama 3', 'RAG'],
    url: 'https://github.com/akverse02/LAWLLAMA',
  },
  {
    title: 'AI vs Human image classification',
    cat: ['cv'],
    label: 'Computer vision',
    img: '/screenshots/ai-vs-human.jpg',
    alt: 'AI vs Human image classification project',
    desc: 'A CNN that tells AI-generated images from real photographs, using Haar wavelet, DCT and Gabor filter features.',
    tags: ['TensorFlow', 'Keras', 'OpenCV', 'CNN'],
    url: 'https://github.com/akverse02/AI-vs-Human-Image-Classification',
  },
  {
    title: 'Heart failure prediction',
    cat: ['ml'],
    label: 'Machine learning',
    img: '/screenshots/heart-failure.jpg',
    alt: 'Heart failure prediction project',
    desc: 'Predicts heart failure from clinical data using feature engineering and a Random Forest model.',
    tags: ['Python', 'Scikit-learn', 'Random Forest'],
    url: 'https://github.com/akverse02/HEART-FAILURE-MODEL',
  },
  {
    title: 'IMDB rating analysis',
    cat: ['data'],
    label: 'Data analysis',
    img: '/screenshots/imdb-analysis.jpg',
    alt: 'IMDB rating analysis charts',
    desc: 'Exploratory analysis of 1,000 movies, looking at what drives ratings, with Pandas, Matplotlib and Seaborn.',
    tags: ['Pandas', 'Matplotlib', 'Seaborn'],
    url: 'https://github.com/akverse02/IMDB-RATING-ANALYSIS',
  },
  {
    title: 'IEEE ML projects',
    cat: ['ml', 'cv'],
    label: 'Machine learning suite',
    img: '/screenshots/ieee-ml-projects.jpg',
    alt: 'IEEE machine learning projects',
    desc: 'Four projects from IEEE: customer segmentation, plant disease detection, diabetes prediction and salary prediction.',
    tags: ['Machine learning', 'Computer vision', 'Prediction'],
    url: 'https://github.com/akverse02/IEEE-ML-Projects',
  },
]

export const skills = [
  { group: 'Programming', items: ['Python', 'Java', 'C', 'SQL', 'R'] },
  { group: 'AI and ML', items: ['Machine learning', 'Deep learning', 'TensorFlow', 'PyTorch', 'Scikit-learn'] },
  { group: 'Vision and NLP', items: ['Computer vision', 'OpenCV', 'CNN', 'NLP', 'LLMs'] },
  { group: 'Generative AI', items: ['Generative AI', 'RAG', 'Hugging Face', 'Transformers'] },
  { group: 'Data', items: ['Pandas', 'NumPy', 'Matplotlib', 'Seaborn', 'XGBoost', 'Apache Spark'] },
  { group: 'Tools', items: ['Git and GitHub', 'VS Code', 'Jupyter', 'FastAPI', 'Flask', 'MySQL'] },
]

export const experience = [
  { role: 'AI Automation & Agentic AI internship', org: 'IBM SkillsBuild, ongoing', text: 'Applied learning in AI automation, workflows and agentic AI systems.' },
  { role: 'AI/ML Internship Lead', org: 'AI Arcade', text: 'Led an AI/ML internship, mentoring students and guiding them through practical machine learning tasks.' },
  { role: 'Design Lead', org: 'IEEE SB VJEC', text: 'Leads design, visual communication and creative direction for technical programmes and student activities.' },
  { role: 'Design Lead', org: 'IEEE RAS SBC VJEC', text: "Provides design leadership for the robotics and automation chapter's activities and outreach." },
]

export const certs = [
  ['Data Analysis Using Python', 'IBM'],
  ['Data Fundamentals', 'IBM'],
  ['Big Data Foundations', 'IBM'],
  ['AI Automation & Agentic AI', 'IBM SkillsBuild'],
  ['Power BI', 'Microsoft'],
  ['Machine Learning Foundations', 'LinkedIn Learning'],
]
