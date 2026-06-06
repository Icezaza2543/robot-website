import { AlertTriangle, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "ยืนยัน",
  cancelText = "ยกเลิก",
  isDestructive = true,
}: ConfirmModalProps) {
  const [isRendered, setIsRendered] = useState(false);

  // Handle animation mounting
  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
    } else {
      const timer = setTimeout(() => setIsRendered(false), 200); // Wait for exit animation
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isRendered && !isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Box */}
      <div 
        className={`relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-200 transform ${
          isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
      >
        <div className="p-6">
          <div className="flex justify-center mb-5">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isDestructive ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'}`}>
              {isDestructive ? <Trash2 className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
            </div>
          </div>
          
          <h3 className="text-xl font-black text-center text-gray-900 mb-2">
            {title}
          </h3>
          <p className="text-sm text-center text-gray-500 mb-8 px-2 leading-relaxed">
            {description}
          </p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-bold text-sm rounded-2xl hover:bg-gray-200 transition active:scale-95"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 py-3 px-4 font-bold text-sm text-white rounded-2xl transition active:scale-95 shadow-md ${
                isDestructive 
                  ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' 
                  : 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/20'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
