"use client";
dotenv.config();
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
const key = process.env.NEXT_PUBLIC_API_KEY;

declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

const generateContent = async (prompt: string) => {
  const genAI = new GoogleGenerativeAI(key || "");
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent([prompt]);
  return result.response.text();
};

export default function VoiceRec() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingComplete, setRecordingComplete] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [transcripts, setTranscripts] = useState<string[]>([]);
  const [generatedContent, setGeneratedContent] = useState("");
  const recognitionRef = useRef<any>(null);

  const startRecording = () => {
    setIsRecording(true);
    recognitionRef.current = new window.webkitSpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;

    recognitionRef.current.onresult = (event: any) => {
      const { transcript } = event.results[event.results.length - 1][0];
      setTranscript(transcript);
    };

    recognitionRef.current.onend = () => {
      if (isRecording) {
        recognitionRef.current.start();
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      // Handle error display
    };

    recognitionRef.current.start();
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setRecordingComplete(true);
      setTranscripts([...transcripts, transcript]);
      setTranscript("");
      handleGenerateContent(transcript);
    }
  };

  const handleToggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  };

  const handleGenerateContent = async (transcript: string) => {
    try {
      const content = await generateContent(transcript);
      setGeneratedContent(content);
    } catch (error) {
      console.error("Error generating content:", error);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen w-full bg-gradient-to-r from-black via-white to-black text-white">
      <div className="flex flex-col lg:flex-row w-full max-w-6xl mx-auto p-4 space-y-4 lg:space-y-0 lg:space-x-4">
        <div className="flex-1 lg:w-3/4 bg-white text-gray-900 rounded-lg shadow-lg p-6 flex flex-col">
          <motion.div
            className="flex-1 bg-gray-900 text-white rounded-lg p-4 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex justify-between items-center mb-4">
              <div className="space-y-1">
                <p className="text-xl font-semibold">
                  {recordingComplete ? "Recording Complete" : "Recording"}
                </p>
                <p className="text-sm text-gray-300">
                  {recordingComplete
                    ? "Thanks for talking."
                    : "Start speaking..."}
                </p>
              </div>
              {isRecording && (
                <div className="w-4 h-4 rounded-full bg-yellow-500 animate-pulse" />
              )}
            </div>
            {transcript && (
              <div className="border border-gray-700 rounded-md p-4 bg-gray-800 overflow-auto max-h-32">
                <p className="text-gray-300">{transcript}</p>
              </div>
            )}
            {generatedContent && (
              <div className="border border-gray-700 rounded-md p-4 bg-gray-800 mt-4 overflow-auto max-h-96">
                <p className="text-gray-300 whitespace-pre-line">
                  {generatedContent}
                </p>
              </div>
            )}
          </motion.div>

          <div className="flex justify-center mt-4">
            <button
              onClick={handleToggleRecording}
              className={`flex items-center justify-center ${
                isRecording ? "bg-red-600" : "bg-blue-600"
              } hover:${
                isRecording ? "bg-red-700" : "bg-blue-700"
              } rounded-full w-24 h-24 text-white font-bold text-xl shadow-lg transition-transform transform hover:scale-110`}
            >
              {isRecording ? "STOP" : "START"}
            </button>
          </div>
        </div>

        <div className="lg:w-1/4 bg-gray-800 text-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Transcripts</h2>
          <div className="space-y-2 overflow-auto max-h-96">
            {transcripts.map((item, index) => (
              <div
                key={index}
                className="border border-gray-600 rounded-md p-2 bg-gray-900"
              >
                <p className="text-gray-300">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
