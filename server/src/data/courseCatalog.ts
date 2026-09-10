import type { Recommendation } from '../types.js';

export type CatalogItem = Omit<Recommendation, 'relevanceScore' | 'reasons'>;

export const courseCatalog: CatalogItem[] = [
  {
    id: 'fcc-responsive-web',
    title: 'Responsive Web Design',
    description:
      'Learn HTML and CSS by building real pages: forms, flexbox, grid, accessibility and responsive layouts.',
    type: 'course',
    url: 'https://www.freecodecamp.org/learn/2022/responsive-web-design/',
    difficulty: 'beginner',
    skills: ['HTML', 'CSS'],
  },
  {
    id: 'odin-foundations',
    title: 'The Odin Project: Foundations',
    description:
      'A full introduction to web development covering HTML, CSS, JavaScript, Git and how the web works.',
    type: 'course',
    url: 'https://www.theodinproject.com/paths/foundations',
    difficulty: 'beginner',
    skills: ['HTML', 'CSS', 'JavaScript', 'Git'],
  },
  {
    id: 'mdn-learn-web',
    title: 'MDN Learn Web Development',
    description:
      'The definitive structured guide to web fundamentals straight from the browser documentation maintainers.',
    type: 'resource',
    url: 'https://developer.mozilla.org/en-US/docs/Learn',
    difficulty: 'beginner',
    skills: ['HTML', 'CSS', 'JavaScript'],
  },
  {
    id: 'cs50x',
    title: 'CS50x: Introduction to Computer Science',
    description:
      "Harvard's flagship intro to computer science covering C, algorithms, memory, Python, SQL and web basics.",
    type: 'course',
    url: 'https://cs50.harvard.edu/x/',
    difficulty: 'beginner',
    skills: ['C', 'Algorithms', 'Python', 'SQL'],
  },
  {
    id: 'javascript-info',
    title: 'The Modern JavaScript Tutorial',
    description:
      'Deep, example-driven coverage of the whole JavaScript language from basics to event loop and modules.',
    type: 'resource',
    url: 'https://javascript.info',
    difficulty: 'intermediate',
    skills: ['JavaScript'],
  },
  {
    id: 'mdn-js-guide',
    title: 'MDN JavaScript Guide',
    description:
      'Official reference-style guide to JavaScript syntax, objects, async patterns and language internals.',
    type: 'resource',
    url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide',
    difficulty: 'intermediate',
    skills: ['JavaScript'],
  },
  {
    id: 'react-dev-learn',
    title: 'React Official Docs: Learn React',
    description:
      'The official React curriculum covering components, state, hooks, data fetching and thinking in React.',
    type: 'course',
    url: 'https://react.dev/learn',
    difficulty: 'intermediate',
    skills: ['React', 'JavaScript'],
  },
  {
    id: 'fcc-front-end-libraries',
    title: 'Front End Development Libraries',
    description:
      'freeCodeCamp certification covering React, Redux, Bootstrap and Sass through hands-on projects.',
    type: 'course',
    url: 'https://www.freecodecamp.org/learn/front-end-development-libraries/',
    difficulty: 'intermediate',
    skills: ['React', 'Redux', 'Bootstrap'],
  },
  {
    id: 'node-official-learn',
    title: 'Node.js Official Learning Resources',
    description:
      'Guides from the Node.js project on modules, streams, file system, HTTP servers and the event loop.',
    type: 'resource',
    url: 'https://nodejs.org/en/learn',
    difficulty: 'intermediate',
    skills: ['Node.js', 'JavaScript'],
  },
  {
    id: 'express-getting-started',
    title: 'Express Official Getting Started',
    description:
      'Build web servers and REST APIs with Express: routing, middleware, static files and error handling.',
    type: 'course',
    url: 'https://expressjs.com/en/starter/installing.html',
    difficulty: 'intermediate',
    skills: ['Node.js', 'Express', 'REST APIs'],
  },
  {
    id: 'odin-nodejs',
    title: 'The Odin Project: NodeJS Path',
    description:
      'Full stack JavaScript track with Express, MongoDB, testing, authentication and deployment projects.',
    type: 'course',
    url: 'https://www.theodinproject.com/paths/full-stack-javascript/courses/nodejs',
    difficulty: 'intermediate',
    skills: ['Node.js', 'Express', 'MongoDB', 'Testing'],
  },
  {
    id: 'python-tutorial',
    title: 'Python Official Tutorial',
    description:
      'The canonical introduction to Python from the docs: syntax, data structures, functions, classes and modules.',
    type: 'course',
    url: 'https://docs.python.org/3/tutorial/',
    difficulty: 'beginner',
    skills: ['Python'],
  },
  {
    id: 'automate-boring-stuff',
    title: 'Automate the Boring Stuff with Python',
    description:
      'Free practical Python book focused on automating real-world tasks: files, spreadsheets, scraping and more.',
    type: 'resource',
    url: 'https://automatetheboringstuff.com',
    difficulty: 'beginner',
    skills: ['Python', 'Automation'],
  },
  {
    id: 'fcc-scientific-python',
    title: 'Scientific Computing with Python',
    description:
      'freeCodeCamp certification teaching Python through numerical computing and algorithm challenges.',
    type: 'course',
    url: 'https://www.freecodecamp.org/learn/scientific-computing-with-python/',
    difficulty: 'beginner',
    skills: ['Python', 'NumPy'],
  },
  {
    id: 'kaggle-python',
    title: 'Kaggle: Python',
    description:
      'Short hands-on notebook course for Python essentials aimed at data work: lists, loops, functions, libraries.',
    type: 'course',
    url: 'https://www.kaggle.com/learn/python',
    difficulty: 'beginner',
    skills: ['Python', 'Data Science'],
  },
  {
    id: 'kaggle-intro-ml',
    title: 'Kaggle: Intro to Machine Learning',
    description:
      'Build your first ML models: decision trees, validation, overfitting and random forests on real datasets.',
    type: 'course',
    url: 'https://www.kaggle.com/learn/intro-to-machine-learning',
    difficulty: 'beginner',
    skills: ['Machine Learning', 'Python', 'scikit-learn'],
  },
  {
    id: 'google-ml-crash-course',
    title: 'Google Machine Learning Crash Course',
    description:
      "Google's self-study ML course with video lectures and interactive exercises using TensorFlow APIs.",
    type: 'course',
    url: 'https://developers.google.com/machine-learning/crash-course',
    difficulty: 'intermediate',
    skills: ['Machine Learning', 'TensorFlow', 'Python'],
  },
  {
    id: 'fastai',
    title: 'Practical Deep Learning for Coders',
    description:
      'Top-down deep learning course: train state of the art models fast with PyTorch and the fastai library.',
    type: 'course',
    url: 'https://course.fast.ai',
    difficulty: 'advanced',
    skills: ['Deep Learning', 'PyTorch', 'Machine Learning', 'Python'],
  },
  {
    id: 'hf-nlp-course',
    title: 'Hugging Face NLP Course',
    description:
      'Learn transformers, fine-tuning and building NLP applications with the Hugging Face ecosystem.',
    type: 'course',
    url: 'https://huggingface.co/learn/nlp-course',
    difficulty: 'advanced',
    skills: ['NLP', 'Transformers', 'Machine Learning', 'Python'],
  },
  {
    id: 'kaggle-pandas',
    title: 'Kaggle: Pandas',
    description:
      'Hands-on course on the core data manipulation library: indexing, grouping, joining and reshaping data.',
    type: 'course',
    url: 'https://www.kaggle.com/learn/pandas',
    difficulty: 'beginner',
    skills: ['Pandas', 'Python', 'Data Science'],
  },
  {
    id: 'kaggle-data-viz',
    title: 'Kaggle: Data Visualization',
    description:
      'Create clear, insightful charts with seaborn and matplotlib while working with real datasets.',
    type: 'course',
    url: 'https://www.kaggle.com/learn/data-visualization',
    difficulty: 'beginner',
    skills: ['Data Visualization', 'Python', 'seaborn'],
  },
  {
    id: 'fcc-data-analysis',
    title: 'Data Analysis with Python',
    description:
      'freeCodeCamp certification on reading, cleaning and analyzing data with NumPy, pandas and matplotlib.',
    type: 'course',
    url: 'https://www.freecodecamp.org/learn/data-analysis-with-python/',
    difficulty: 'intermediate',
    skills: ['Data Science', 'pandas', 'NumPy', 'Python'],
  },
  {
    id: 'react-native-docs',
    title: 'React Native Official Docs',
    description:
      'Build native iOS and Android apps with React: components, navigation, native APIs and debugging.',
    type: 'resource',
    url: 'https://reactnative.dev/docs/getting-started',
    difficulty: 'intermediate',
    skills: ['React Native', 'React', 'Mobile Development'],
  },
  {
    id: 'flutter-codelab',
    title: 'Flutter First App Codelab',
    description:
      "Google's guided codelab where you build a complete mobile app with Dart and Flutter from scratch.",
    type: 'course',
    url: 'https://docs.flutter.dev/get-started/codelab',
    difficulty: 'beginner',
    skills: ['Flutter', 'Dart', 'Mobile Development'],
  },
  {
    id: 'android-basics-compose',
    title: 'Android Basics with Compose',
    description:
      "Google's official course for building native Android apps with Kotlin and Jetpack Compose.",
    type: 'course',
    url: 'https://developer.android.com/courses/android-basics-compose/course',
    difficulty: 'beginner',
    skills: ['Android', 'Kotlin', 'Mobile Development'],
  },
  {
    id: 'docker-get-started',
    title: 'Docker Official Get Started',
    description:
      'Containerize applications step by step: images, volumes, multi-container apps and CI with Docker.',
    type: 'course',
    url: 'https://docs.docker.com/get-started/',
    difficulty: 'intermediate',
    skills: ['Docker', 'Containers', 'DevOps'],
  },
  {
    id: 'k8s-tutorials',
    title: 'Kubernetes Official Tutorials',
    description:
      'Deploy, scale and update containerized apps on Kubernetes: pods, services and deployments hands-on.',
    type: 'course',
    url: 'https://kubernetes.io/docs/tutorials/',
    difficulty: 'advanced',
    skills: ['Kubernetes', 'Docker', 'DevOps'],
  },
  {
    id: 'github-actions-docs',
    title: 'GitHub Actions Documentation',
    description:
      'Automate builds, tests and deployments with CI/CD workflows directly inside your GitHub repos.',
    type: 'resource',
    url: 'https://docs.github.com/en/actions',
    difficulty: 'intermediate',
    skills: ['CI/CD', 'GitHub Actions', 'DevOps'],
  },
  {
    id: 'missing-semester',
    title: 'MIT: The Missing Semester of Your CS Education',
    description:
      'Practical tooling skills courses rarely cover: shell, scripting, Git internals, debugging and editors.',
    type: 'course',
    url: 'https://missing.csail.mit.edu',
    difficulty: 'beginner',
    skills: ['Shell', 'Git', 'Developer Tools'],
  },
  {
    id: 'owasp-top-10',
    title: 'OWASP Top 10',
    description:
      'The industry standard list of the most critical web application security risks and how to prevent them.',
    type: 'resource',
    url: 'https://owasp.org/www-project-top-ten/',
    difficulty: 'intermediate',
    skills: ['Security', 'Web Security'],
  },
  {
    id: 'portswigger-academy',
    title: 'PortSwigger Web Security Academy',
    description:
      'Free interactive labs on real vulnerabilities: SQL injection, XSS, CSRF, access control and more.',
    type: 'course',
    url: 'https://portswigger.net/web-security',
    difficulty: 'intermediate',
    skills: ['Security', 'Web Security', 'Penetration Testing'],
  },
  {
    id: 'otw-bandit',
    title: 'OverTheWire: Bandit',
    description:
      'Wargame that teaches Linux and security basics by hacking your way through increasingly hard levels.',
    type: 'project',
    url: 'https://overthewire.org/wargames/bandit/',
    difficulty: 'beginner',
    skills: ['Security', 'Linux', 'Shell'],
  },
  {
    id: 'postgres-tutorial',
    title: 'PostgreSQL Official Tutorial',
    description:
      'Learn relational databases with Postgres: SQL queries, joins, transactions, views and performance.',
    type: 'course',
    url: 'https://www.postgresql.org/docs/current/tutorial.html',
    difficulty: 'beginner',
    skills: ['SQL', 'PostgreSQL', 'Databases'],
  },
  {
    id: 'sqlbolt',
    title: 'SQLBolt: Learn SQL in Minutes',
    description:
      'Interactive lessons that teach SQL queries through simple exercises right in the browser.',
    type: 'course',
    url: 'https://sqlbolt.com',
    difficulty: 'beginner',
    skills: ['SQL', 'Databases'],
  },
  {
    id: 'system-design-primer',
    title: 'System Design Primer',
    description:
      'Open source guide to scalable systems: load balancing, caching, sharding, consistency and interview prep.',
    type: 'resource',
    url: 'https://github.com/donnemartin/system-design-primer',
    difficulty: 'advanced',
    skills: ['System Design', 'Architecture', 'Scalability'],
  },
  {
    id: 'git-pro-book',
    title: 'Pro Git Book',
    description:
      'The complete free book on Git, from basic version control to branching models and internals.',
    type: 'resource',
    url: 'https://git-scm.com/book/en/v2',
    difficulty: 'beginner',
    skills: ['Git', 'Version Control'],
  },
  {
    id: 'refactoring-guru-patterns',
    title: 'Refactoring Guru: Design Patterns',
    description:
      'Visual explanations of classic design patterns and refactoring techniques with code examples.',
    type: 'resource',
    url: 'https://refactoring.guru/design-patterns',
    difficulty: 'intermediate',
    skills: ['Design Patterns', 'OOP', 'Architecture'],
  },
  {
    id: 'frontend-mentor-challenges',
    title: 'Frontend Mentor Challenges',
    description:
      'Realistic frontend project briefs with designs to build, sharpening HTML, CSS and JS workflow skills.',
    type: 'project',
    url: 'https://www.frontendmentor.io/challenges',
    difficulty: 'beginner',
    skills: ['HTML', 'CSS', 'JavaScript', 'Frontend'],
  },
  {
    id: 'roadmap-sh-projects',
    title: 'roadmap.sh Project Ideas',
    description:
      'Guided project specifications with requirements and milestones for building a strong portfolio.',
    type: 'project',
    url: 'https://roadmap.sh/projects',
    difficulty: 'intermediate',
    skills: ['Full Stack', 'Frontend', 'Backend'],
  },
  {
    id: 'build-your-own-x',
    title: 'Build Your Own X',
    description:
      'Step-by-step guides to build databases, interpreters, git, containers and more from scratch.',
    type: 'project',
    url: 'https://github.com/codecrafters-io/build-your-own-x',
    difficulty: 'advanced',
    skills: ['Systems Programming', 'Algorithms', 'Architecture'],
  },
  {
    id: 'app-ideas-collection',
    title: 'App Ideas Collection',
    description:
      'Curated list of app projects tiered from beginner to advanced, each with user stories and features.',
    type: 'project',
    url: 'https://github.com/florinpop17/app-ideas',
    difficulty: 'beginner',
    skills: ['JavaScript', 'Frontend', 'Full Stack'],
  },
  {
    id: 'kaggle-titanic',
    title: 'Kaggle: Titanic Competition',
    description:
      'The classic beginner ML competition: clean data, engineer features and submit predictions to the leaderboard.',
    type: 'project',
    url: 'https://www.kaggle.com/competitions/titanic',
    difficulty: 'beginner',
    skills: ['Machine Learning', 'Python', 'Data Science'],
  },
];
