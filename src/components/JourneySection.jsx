import { Check, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
const modules = [
    {
        id: "01",
        title: "Introduction to the Programme",
        items: [
            "DS vs ML vs DL vs AI",
            "What is AI?",
            "The power of AI/ML",
            "The limitations of AI/ML",
            "Brief about Definitions, Use Cases, Lifecycle",
        ],
    },
    {
        id: "02",
        title: "Python Fundamentals",
        items: [
            "Variables, Numbers",
            "Strings Lists, Dictionaries, Sets",
            "Tuples If condition",
            "For loop Functions",
            "Lambda Functions",
            "Modules (pip install)",
            "File Handling (Read/Write)",
            "Exception Handling",
            "Classes & Objects",
        ],
    },
    {
        id: "03",
        title: "Data Libraries",
        items: [
            "Saving & Loading Datasets",
            "Filtering, Sorting, Renaming",
            "Handling Missing Values",
            "Groupby & Aggregations",
            "NumPy Arrays & Operations",
        ],
    },
    {
        id: "04",
        title: "EDA & Data Visualization",
        items: [
            "Exploratory Analysis Techniques",
            "Matplotlib & Seaborn Charts",
            "Correlation & Distribution Plots",
            "Interactive Dashboards with Plotly",
        ],
    },
    {
        id: "05",
        title: "Statistics for Data Science",
        items: [
            "Descriptive Statistics",
            "Probability Distributions",
            "Hypothesis Testing",
            "Confidence Intervals",
            "A/B Testing Concepts",
        ],
    },
    {
        id: "06",
        title: "Machine Learning Basics",
        items: [
            "Supervised vs Unsupervised Learning",
            "Train/Test Split & Cross Validation",
            "Feature Engineering",
            "Model Evaluation Metrics",
        ],
    },
    {
        id: "07",
        title: "Regression Algorithms",
        items: [
            "Linear Regression",
            "Polynomial Regression",
            "Ridge & Lasso Regression",
            "Gradient Descent Optimization",
        ],
    },
    /* {
      id: "08",
      title: "Classification Algorithms",
      items: [
        "Logistic Regression",
        "Decision Trees & Random Forest",
        "Support Vector Machines",
        "K-Nearest Neighbors",
        "Naive Bayes Classifier",
      ],
    },
    {
      id: "09",
      title: "Ensemble Methods",
      items: [
        "Bagging & Boosting",
        "XGBoost & LightGBM",
        "Stacking & Blending",
        "Hyperparameter Tuning",
      ],
    },
    {
      id: "10",
      title: "Clustering & Dimensionality Reduction",
      items: [
        "K-Means Clustering",
        "Hierarchical Clustering",
        "DBSCAN",
        "PCA & t-SNE",
      ],
    },
    {
      id: "11",
      title: "Deep Learning Fundamentals",
      items: [
        "Neural Network Architecture",
        "Activation Functions",
        "Backpropagation",
        "TensorFlow & Keras Basics",
      ],
    },
    {
      id: "12",
      title: "Computer Vision",
      items: [
        "Image Processing Basics",
        "Convolutional Neural Networks",
        "Object Detection",
        "Transfer Learning",
      ],
    },
    {
      id: "13",
      title: "Natural Language Processing",
      items: [
        "Text Preprocessing",
        "Word Embeddings",
        "Sentiment Analysis",
        "Transformers & BERT Basics",
      ],
    },
    {
      id: "14",
      title: "GenAI & LLM Introduction",
      items: [
        "Introduction to Generative AI",
        "Working with OpenAI APIs",
        "Prompt Engineering",
        "Building AI Applications",
      ],
    },
    {
      id: "15",
      title: "MLOps Basics",
      items: [
        "Model Deployment with Flask",
        "Docker Basics",
        "CI/CD for ML",
        "Model Monitoring",
      ],
    },
    {
      id: "16",
      title: "SQL for Data Science",
      items: [
        "SQL Queries & Joins",
        "Aggregations & Window Functions",
        "Database Design Basics",
        "Working with Real Databases",
      ],
    },
    {
      id: "17",
      title: "Capstone Projects",
      items: [
        "End-to-End ML Project",
        "Real-World Dataset Analysis",
        "Model Deployment",
        "Portfolio Building",
      ],
    },
    {
      id: "18",
      title: "Career Preparation",
      items: [
        "Resume Building",
        "Interview Preparation",
        "LinkedIn Optimization",
        "Mock Interviews",
      ],
    }, */
];
const JourneySection = () => {
    return (<section className="py-20 px-2 sm:px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14">
          {/* Left Column - Title & Chart */}
          <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="lg:sticky lg:top-28 lg:self-start">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-sora leading-[1.15] mb-10">
              Your 180-Day
              <br />
              Journey to
              <br />
              Master AI &
              <br />
              Machine
              <br />
              Learning
            </h2>

            {/* Chart Card */}
            <motion.div className="card-teal" whileHover={{ borderColor: "hsl(163 82% 32% / 0.4)" }} transition={{ duration: 0.3 }}>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-muted-foreground"/>
                  <span className="text-muted-foreground text-sm">AI&ML in Global Growth</span>
                </div>
                <span className="text-xs bg-primary/20 text-primary px-2.5 py-1 rounded-full font-medium">● (2025–2028)</span>
              </div>
              
              {/* Chart */}
              <div className="h-44 relative">
                <svg viewBox="0 0 400 140" className="w-full h-full">
                  <defs>
                    <linearGradient id="chartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="hsl(163 82% 32% / 0.25)"/>
                      <stop offset="100%" stopColor="hsl(163 82% 32% / 0)"/>
                    </linearGradient>
                  </defs>
                  
                  {/* Grid Lines */}
                  {[25, 50, 75, 100].map((y) => (<line key={y} x1="45" y1={y} x2="380" y2={y} stroke="hsl(160 15% 18%)" strokeWidth="1"/>))}
                  
                  {/* Y-axis labels */}
                  <text x="38" y="105" fill="hsl(160 8% 50%)" fontSize="10" textAnchor="end">20$</text>
                  <text x="38" y="80" fill="hsl(160 8% 50%)" fontSize="10" textAnchor="end">40$</text>
                  <text x="38" y="55" fill="hsl(160 8% 50%)" fontSize="10" textAnchor="end">60$</text>
                  <text x="38" y="30" fill="hsl(160 8% 50%)" fontSize="10" textAnchor="end">80$</text>
                  
                  {/* X-axis labels */}
                  <text x="75" y="125" fill="hsl(160 8% 50%)" fontSize="10" textAnchor="middle">2025</text>
                  <text x="165" y="125" fill="hsl(160 8% 50%)" fontSize="10" textAnchor="middle">2026</text>
                  <text x="255" y="125" fill="hsl(160 8% 50%)" fontSize="10" textAnchor="middle">2027</text>
                  <text x="345" y="125" fill="hsl(160 8% 50%)" fontSize="10" textAnchor="middle">2028</text>
                  
                  {/* Chart Area */}
                  <motion.path d="M75 90 Q120 80 165 70 Q210 60 255 50 Q300 40 345 28 L345 110 L75 110 Z" fill="url(#chartGrad)" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.3 }}/>
                  
                  {/* Chart Line */}
                  <motion.path d="M75 90 Q120 80 165 70 Q210 60 255 50 Q300 40 345 28" stroke="hsl(163 82% 32%)" strokeWidth="2.5" fill="none" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.2, ease: "easeOut" }}/>
                  
                  {/* Data points */}
                  {[
            { cx: 75, cy: 90, delay: 0.4 },
            { cx: 165, cy: 70, delay: 0.6 },
            { cx: 255, cy: 50, delay: 0.8 },
            { cx: 345, cy: 28, delay: 1.0 },
        ].map((point) => (<motion.circle key={point.cx} cx={point.cx} cy={point.cy} r="4" fill="hsl(163 82% 32%)" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.3, delay: point.delay, type: "spring" }}/>))}
                </svg>
              </div>
              
              <div className="flex items-center gap-5 mt-4 text-xs text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-0.5 bg-muted-foreground"/> Progress
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary"/> CAGR -38%
                </span>
                <span>Markets and Markets</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Modules */}
          <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }} className="space-y-0 md:space-y-4">
            {modules.map((module, moduleIndex) => (<motion.div key={module.id} initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-30px" }} transition={{ duration: 0.5, delay: moduleIndex * 0.03 }} whileHover={{ borderColor: "hsl(163 82% 32% / 0.4)", y: -2 }} className="card-teal mb-5 md:mb-0 sticky md:static" style={{
                top: 24 + moduleIndex * 10,
                zIndex: 10 + moduleIndex,
            }}>
                <p className="text-xs text-muted-foreground mb-1.5 font-medium">MODULE {module.id}</p>
                <h3 className="text-lg font-bold font-sora mb-4 text-foreground">{module.title}</h3>
                <div className="space-y-2.5">
                  {module.items.map((item, index) => (<div key={index} className="module-check">
                      <Check className="w-4 h-4 flex-shrink-0 mt-0.5"/>
                      <span className="text-muted-foreground">{item}</span>
                    </div>))}
                </div>
              </motion.div>))}
          </motion.div>
        </div>
      </div>
    </section>);
};
export default JourneySection;
