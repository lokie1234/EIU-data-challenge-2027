'use client';
import { useEffect, useRef, useState } from 'react';
import './GridScanWebcam.css';
const FACE_API_URL = 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js';
let faceApiLoader = null;

const loadFaceApi = () => {
  if (window.faceapi) return Promise.resolve(window.faceapi);
  if (!faceApiLoader) {
    faceApiLoader = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = FACE_API_URL;
      script.async = true;
      script.onload = () => (window.faceapi ? resolve(window.faceapi) : reject(new Error('face-api.js')));
      script.onerror = () => {
        faceApiLoader = null;
        reject(new Error('face-api.js'));
      };
      document.head.appendChild(script);
    });
  }
  return faceApiLoader;
};

const STATUS_LABELS = {
  loading: 'Loading face tracking',
  searching: 'Looking for a face',
  tracking: 'Tracking',
  blocked: 'Camera unavailable'
};

export default function GridScanWebcam({ headRef, modelsPath, showPreview }) {
  const videoRef = useRef(null);
  const [status, setStatus] = useState('loading');
  useEffect(() => {
    const video = videoRef.current;
    const initialHead = headRef.current;
    if (!video) return undefined;
    let stopped = false;
    let stream = null;
    let timer = 0;
    let lost = 0;
    const smooth = { x: 0, y: 0, near: 1, ready: false };
    const run = async () => {
      await Promise.resolve();
      if (stopped) return;
      setStatus('loading');
      try {
        const faceapi = await loadFaceApi();
        await faceapi.nets.tinyFaceDetector.loadFromUri(modelsPath);
        if (stopped) return;
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false
        });
        if (stopped) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        video.srcObject = stream;
        await video.play();
        setStatus('searching');
        const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.45 });
        const detect = async () => {
          if (stopped) return;
          let result = null;
          try {
            result = await faceapi.detectSingleFace(video, options);
          } catch {
            result = null;
          }
          if (stopped) return;
          const head = headRef.current;
          if (result && head) {
            const box = result.box;
            const vw = video.videoWidth || 1;
            const vh = video.videoHeight || 1;
            const x = -((box.x + box.width / 2) / vw - 0.5) * 2;
            const y = -((box.y + box.height / 2) / vh - 0.5) * 2;
            const near = 0.32 / Math.max(0.08, box.width / vw);
            const k = smooth.ready ? 0.45 : 1;
            smooth.x += (x - smooth.x) * k;
            smooth.y += (y - smooth.y) * k;
            smooth.near += (near - smooth.near) * k;
            smooth.ready = true;
            lost = 0;
            head.active = true;
            head.move(smooth.x, smooth.y, smooth.near);
            setStatus('tracking');
          } else if (head && ++lost > 12 && head.active) {
            head.active = false;
            smooth.ready = false;
            head.release();
            setStatus('searching');
          }
          timer = window.setTimeout(detect, 40);
        };
        detect();
      } catch {
        if (!stopped) setStatus('blocked');
      }
    };
    run();

    return () => {
      stopped = true;
      window.clearTimeout(timer);
      stream?.getTracks().forEach(track => track.stop());
      video.srcObject = null;
      const head = initialHead;
      if (head?.active) {
        head.active = false;
        head.release();
      }
    };
  }, [headRef, modelsPath]);

  return <div className={showPreview ? 'grid-scan-preview' : 'grid-scan-hidden'}>
    <video ref={videoRef} className="grid-scan-video" muted playsInline />
    {showPreview && <span className="grid-scan-status">{STATUS_LABELS[status]}</span>}
  </div>;
}
