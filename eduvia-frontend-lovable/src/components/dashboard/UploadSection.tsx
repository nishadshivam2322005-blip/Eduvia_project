import { useState, useCallback } from "react";
import { Upload, FileText, Link as LinkIcon, X, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadPDF } from "@/lib/api";
import { useNavigate } from "react-router-dom";

interface UploadedItem {
  id: string;
  name: string;
  type: "file" | "link";
  status: "uploaded" | "processing" | "done" | "error";
}

const UploadSection = () => {
  const [items, setItems] = useState<UploadedItem[]>([]);
  const [linkInput, setLinkInput] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [careerGoal, setCareerGoal] = useState("Full Stack Developer");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const navigate = useNavigate();

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.name.endsWith('.pdf'));
    if (files.length > 0) {
      setSelectedFile(files[0]);
      setItems(prev => [...prev, {
        id: crypto.randomUUID(),
        name: files[0].name,
        type: "file",
        status: "uploaded"
      }]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      setSelectedFile(files[0]);
      setItems(prev => [...prev, {
        id: crypto.randomUUID(),
        name: files[0].name,
        type: "file",
        status: "uploaded"
      }]);
    }
  };

  const addLink = () => {
    if (!linkInput.trim()) return;
    setItems(prev => [...prev, {
      id: crypto.randomUUID(),
      name: linkInput.trim(),
      type: "link",
      status: "done"
    }]);
    setLinkInput("");
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    setSelectedFile(null);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setErrorMsg("Please select a PDF file first");
      return;
    }
    setIsAnalyzing(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      const res = await uploadPDF(formData, careerGoal);

      setSuccessMsg(`✅ Found ${res.data.skills_found} skills and ${res.data.gaps_found} gaps!`);
      setItems(prev => prev.map(item =>
        item.name === selectedFile.name
          ? { ...item, status: "done" }
          : item
      ));

      // Navigate to dashboard after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "Upload failed. Please try again.");
      setItems(prev => prev.map(item =>
        item.name === selectedFile?.name
          ? { ...item, status: "error" }
          : item
      ));
    }
    setIsAnalyzing(false);
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-card space-y-4">
      <h3 className="text-lg font-display font-semibold text-foreground">Upload Your Skills</h3>

      {/* Career Goal Selector */}
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">Career Goal</label>
        <select
          value={careerGoal}
          onChange={e => setCareerGoal(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm focus:ring-2 focus:ring-primary/30 outline-none"
        >
          <option>Full Stack Developer</option>
          <option>Data Scientist</option>
          <option>AI/ML Engineer</option>
          <option>DevOps Engineer</option>
          <option>Mobile Developer</option>
          <option>UI/UX Designer</option>
        </select>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging ? "border-primary bg-primary/5" : "border-border"
        }`}
      >
        <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm text-muted-foreground mb-2">
          Drag & drop your certificate PDF
        </p>
        <label>
          <span className="text-sm text-primary cursor-pointer hover:underline">
            Browse PDF files
          </span>
          <input
            type="file"
            className="hidden"
            accept=".pdf"
            onChange={handleFileSelect}
          />
        </label>
      </div>

      {/* Link input */}
      <div className="flex gap-2">
        <Input
          placeholder="Paste GitHub, YouTube, or course link..."
          value={linkInput}
          onChange={e => setLinkInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addLink()}
        />
        <Button variant="default" size="default" onClick={addLink}>
          <LinkIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Uploaded items */}
      {items.length > 0 && (
        <div className="space-y-2">
          {items.map(item => (
            <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              {item.type === "file"
                ? <FileText className="h-4 w-4 text-primary" />
                : <LinkIcon className="h-4 w-4 text-accent" />
              }
              <span className="text-sm text-foreground flex-1 truncate">{item.name}</span>
              {item.status === "processing" && (
                <Loader2 className="h-4 w-4 text-primary animate-spin" />
              )}
              {item.status === "done" && (
                <CheckCircle className="h-4 w-4 text-primary" />
              )}
              {item.status === "error" && (
                <span className="text-xs text-destructive">Failed</span>
              )}
              <button
                onClick={() => removeItem(item.id)}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Success / Error messages */}
      {successMsg && (
        <div className="bg-primary/10 text-primary text-sm px-4 py-3 rounded-lg">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg">
          {errorMsg}
        </div>
      )}

      {/* Analyze Button */}
      <Button
        variant="hero"
        className="w-full"
        onClick={handleAnalyze}
        disabled={isAnalyzing || !selectedFile}
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Analyzing with AI...
          </>
        ) : (
          "✨ Analyze My Skills"
        )}
      </Button>
    </div>
  );
};

export default UploadSection;