import React, { useState, useRef } from 'react';
import { Camera, Wand2, Upload, Loader2, Save } from 'lucide-react';
import { editImageWithGemini } from '../services/geminiService';

export const PhotoEditor: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setEditedImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = async () => {
    if (!selectedImage || !prompt.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // Basic mime type detection from base64 string
      const mimeTypeMatch = selectedImage.match(/^data:(image\/[a-zA-Z]+);base64,/);
      const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';

      const result = await editImageWithGemini(selectedImage, mimeType, prompt);
      
      if (result) {
        setEditedImage(result);
      } else {
        setError("AI 無法生成圖片，請嘗試不同的指令。");
      }
    } catch (err) {
      setError("發生錯誤，請檢查您的 API Key 或網路連線。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-stone-900 text-stone-200 p-4 overflow-y-auto">
      <div className="max-w-md w-full mx-auto space-y-6 pb-20">
        
        <header className="text-center space-y-2">
          <h2 className="text-2xl font-bold flex items-center justify-center gap-2 text-green-500">
            <Camera className="w-6 h-6" />
            軍旅回憶錄
          </h2>
          <p className="text-sm text-stone-400">上傳你的軍旅照片，讓 AI 幫你修圖。</p>
        </header>

        {/* Upload Area */}
        <div className="bg-stone-800 rounded-xl p-4 shadow-lg border border-stone-700">
           <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleImageUpload}
           />
           
           {!selectedImage ? (
             <button 
               onClick={() => fileInputRef.current?.click()}
               className="w-full h-48 border-2 border-dashed border-stone-600 rounded-lg flex flex-col items-center justify-center gap-2 text-stone-500 hover:text-green-400 hover:border-green-400 transition-colors"
             >
               <Upload className="w-8 h-8" />
               <span>點擊上傳照片</span>
             </button>
           ) : (
             <div className="relative">
               <img 
                 src={selectedImage} 
                 alt="Original" 
                 className="w-full h-auto rounded-lg object-contain max-h-[300px] bg-black"
               />
               <button 
                 onClick={() => {
                   setSelectedImage(null);
                   setEditedImage(null);
                 }}
                 className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full hover:bg-red-500 transition-colors"
               >
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                 </svg>
               </button>
             </div>
           )}
        </div>

        {/* Prompt Area */}
        {selectedImage && (
          <div className="bg-stone-800 rounded-xl p-4 shadow-lg border border-stone-700 space-y-4">
            <div>
              <label className="block text-xs font-medium text-stone-400 mb-1">編輯指令 (Prompt)</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="例如：把背景換成復古濾鏡、移除背景的路人..."
                className="w-full bg-stone-900 border border-stone-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none resize-none h-24"
              />
            </div>

            {error && (
              <div className="text-red-400 text-xs p-2 bg-red-900/20 rounded border border-red-900/50">
                {error}
              </div>
            )}

            <button
              onClick={handleEdit}
              disabled={isLoading || !prompt.trim()}
              className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all
                ${isLoading || !prompt.trim() 
                  ? 'bg-stone-700 text-stone-500 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/50 active:scale-95'
                }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  AI 正在思考中...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  開始生成
                </>
              )}
            </button>
          </div>
        )}

        {/* Result Area */}
        {editedImage && (
          <div className="bg-stone-800 rounded-xl p-4 shadow-lg border border-stone-700 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <h3 className="text-green-400 font-bold mb-3 flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
               生成結果
             </h3>
             <img 
               src={editedImage} 
               alt="Edited" 
               className="w-full h-auto rounded-lg shadow-xl mb-4 bg-black"
             />
             <a 
               href={editedImage} 
               download="military-memory-edited.png"
               className="flex items-center justify-center gap-2 w-full py-2 bg-stone-700 hover:bg-stone-600 rounded-lg text-sm transition-colors"
             >
               <Save className="w-4 h-4" />
               下載圖片
             </a>
          </div>
        )}
      </div>
    </div>
  );
};
