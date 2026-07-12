"use client";

import { useRef, useState } from "react";
import { api } from "@/lib/api";

export default function Page() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [ocrResponse, setOcrResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (file: File) => {
    setLoading(true);
    setError("");
    setOcrResponse(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.postFile<any>(
        `${process.env.NEXT_PUBLIC_API_URL}/ocr`,
        formData,
      );

      setOcrResponse(response);
    } catch (err) {
      console.error(err);
      setError("An error occurred while uploading the file.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    await handleFileUpload(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);

    const file = e.dataTransfer.files?.[0];

    if (file) {
      handleFileSelect(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Scan Page</h1>
          <p className="mt-2 text-gray-600">
            Upload an image or receipt for scanning.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Upload Card */}
          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold">Upload File</h2>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`flex h-96 items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
                dragging
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 bg-gray-50"
              }`}
            >
              <div className="text-center">
                <svg
                  className="mx-auto mb-4 h-10 w-10 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 5v9m-5 0H5a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-2M8 9l4-5 4 5"
                  />
                </svg>

                <p className="text-sm text-gray-600">
                  Drag & drop your file here
                </p>

                <p className="mt-1 text-sm text-gray-500">or</p>

                <button
                  type="button"
                  onClick={handleBrowseClick}
                  className="mt-4 rounded-md bg-blue-600 px-5 py-2 text-white transition hover:bg-blue-700"
                >
                  Browse File
                </button>

                <p className="mt-4 text-xs text-gray-500">
                  Max file size: <span className="font-semibold">30 MB</span>
                </p>

                {selectedFile && (
                  <p className="mt-4 text-sm font-medium text-green-600">
                    Selected: {selectedFile.name}
                  </p>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                />
              </div>
            </div>
          </div>

          {/* Response Card */}
          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold">Response</h2>

            <div className="flex h-96 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-4">
              {selectedFile ? (
                <div className="w-full">
                  <p className="font-semibold">Uploaded File</p>

                  <div className="mt-3 rounded-md bg-white p-4 shadow-sm">
                    <p>
                      <strong>Name:</strong> {selectedFile.name}
                    </p>
                    <p>
                      <strong>Type:</strong> {selectedFile.type}
                    </p>
                    <p>
                      <strong>Size:</strong>{" "}
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>

                  <pre className="whitespace-pre-wrap text-sm text-gray-700">
                    {JSON.stringify(ocrResponse, null, 2)}
                  </pre>

                  {/* Replace this section with your OCR/API response later */}
                </div>
              ) : (
                <p className="text-gray-500">
                  Upload a file to see the response here.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
