# Resume Job Match Analyzer(ResuMatch AI)

An AI-powered web application that analyzes resumes against job descriptions to provide detailed insights and optimization recommendations.

## Features

- **PDF Resume Parsing** - Upload PDF or text files with automatic text extraction
- **AI-Powered Analysis** - Uses Google's Gemini AI for comprehensive resume evaluation
- **Match Scoring** - Get percentage match scores and hiring probability estimates
- **Detailed Insights** - Identifies strengths, weaknesses, and missing keywords
- **Actionable Recommendations** - Specific suggestions for resume improvement
- **Interview Preparation** - Generates relevant interview questions based on analysis

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **PDF Processing**: PDF.js
- **AI Integration**: Google Gemini API

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Google Gemini API key

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd resume-job-matcher
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env` file and add your Gemini API key:
```env
VITE_GEMINI_API_KEY=your_actual_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Getting Your Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key and add it to your `.env` file

## Usage

1. **Upload Resume**: Upload a PDF file or paste text content
2. **Add Job Description**: Paste the complete job description
3. **Analyze**: Click the analyze button to get AI-powered insights
4. **Review Results**: Get detailed analysis including:
   - Overall match percentage
   - Strengths and weaknesses
   - Missing keywords
   - Improvement suggestions
   - Interview preparation questions

## Project Structure

```
├── src/
│   ├── ResumeAnalyzer.tsx    # Main component
│   ├── main.tsx              # App entry point
│   └── vite-env.d.ts         # TypeScript declarations
├── index.html                # HTML template
├── package.json              # Dependencies
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript configuration
├── .env                      # Environment variables
└── .gitignore                # Git ignore rules
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues or questions, please open an issue on GitHub.
