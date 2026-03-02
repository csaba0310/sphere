import { useEffect, useRef, useState } from "react";
import { Copy, Check } from "lucide-react";
import { motion } from "framer-motion";
import QRCodeStyling from "qr-code-styling";
import unicityLogo from "/images/unicity_logo.svg";
import { WalletScreen } from "../../../ui/WalletScreen";
import { ModalHeader } from "../../../ui";

interface QRModalProps {
  show: boolean;
  address: string;
  onClose: () => void;
}

// Get QR code size based on screen width
function getQRSize() {
  if (typeof window === "undefined") return 200;
  const width = window.innerWidth;
  if (width < 360) return 160; // iPhone SE
  if (width < 400) return 180;
  return 200;
}

export function QRModal({ show, address, onClose }: QRModalProps) {
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [qrSize, setQrSize] = useState(getQRSize);

  useEffect(() => {
    const handleResize = () => setQrSize(getQRSize());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (show && address && qrCodeRef.current) {
      qrCodeRef.current.innerHTML = "";

      const qrCode = new QRCodeStyling({
        width: qrSize,
        height: qrSize,
        data: address,
        margin: 0,
        qrOptions: {
          typeNumber: 0,
          mode: "Byte",
          errorCorrectionLevel: "M",
        },
        imageOptions: {
          hideBackgroundDots: true,
          imageSize: 0.2,
          margin: 3,
        },
        dotsOptions: {
          type: "rounded",
          color: "#ffffff",
        },
        backgroundOptions: {
          color: "#1a1a1a",
        },
        cornersSquareOptions: {
          type: "extra-rounded",
          color: "#ffffff",
        },
        cornersDotOptions: {
          type: "dot",
          color: "#ffffff",
        },
        image: unicityLogo,
      });

      qrCode.append(qrCodeRef.current);
    }
  }, [show, address, qrSize]);

  return (
    <WalletScreen isOpen={show} onClose={onClose}>
      <ModalHeader variant="screen" title="Receive ALPHA" onClose={onClose} />
      <div className="px-6 py-8 flex flex-col flex-1 items-center">
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-white/45 mb-6 text-center">
          Scan QR code to receive payment
        </p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: "spring" }}
          className="relative bg-neutral-900 p-4 sm:p-6 rounded-2xl shadow-inner mb-6 flex items-center justify-center"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="absolute top-2 left-2 w-5 h-5 sm:w-6 sm:h-6 border-t-[3px] border-l-[3px] sm:border-t-4 sm:border-l-4 border-orange-500 rounded-tl-lg"
          ></motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="absolute top-2 right-2 w-5 h-5 sm:w-6 sm:h-6 border-t-[3px] border-r-[3px] sm:border-t-4 sm:border-r-4 border-orange-500 rounded-tr-lg"
          ></motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="absolute bottom-2 left-2 w-5 h-5 sm:w-6 sm:h-6 border-b-[3px] border-l-[3px] sm:border-b-4 sm:border-l-4 border-orange-500 rounded-bl-lg"
          ></motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="absolute bottom-2 right-2 w-5 h-5 sm:w-6 sm:h-6 border-b-[3px] border-r-[3px] sm:border-b-4 sm:border-r-4 border-orange-500 rounded-br-lg"
          ></motion.div>

          <div ref={qrCodeRef} style={{ width: qrSize, height: qrSize }}></div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full bg-neutral-100 dark:bg-white/4 rounded-xl p-3 sm:p-4 mb-6 border border-neutral-200 dark:border-white/8"
        >
          <p className="text-xs text-neutral-500 dark:text-white/45 mb-2 text-center">
            Your Address
          </p>
          <div className="flex items-center gap-2">
            <a
              href={`https://www.unicity.network/address/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-xs font-mono text-orange-500 dark:text-orange-400 hover:text-orange-400 dark:hover:text-orange-300 break-all text-center transition-colors"
            >
              {address}
            </a>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                navigator.clipboard.writeText(address);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className={`p-2 rounded-lg transition-all ${
                copied
                  ? "bg-green-600 hover:bg-green-500 shadow-lg shadow-green-500/20"
                  : "bg-neutral-200 dark:bg-white/10 hover:bg-neutral-300 dark:hover:bg-white/10"
              } text-neutral-800 dark:text-white`}
              title={copied ? "Copied!" : "Copy address"}
            >
              <motion.div
                initial={false}
                animate={{ rotate: copied ? [0, -10, 10, 0] : 0 }}
                transition={{ duration: 0.3 }}
              >
                {copied ? (
                  <Check className="w-4 h-4 text-white" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </motion.div>
            </motion.button>
          </div>
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onClose}
          className="w-full px-4 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-lg shadow-orange-500/25 transition-all"
        >
          Close
        </motion.button>
      </div>
    </WalletScreen>
  );
}
