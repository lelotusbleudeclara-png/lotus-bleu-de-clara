"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function PhotoUploader({ uploadAction, addVideoAction }) {
  const router = useRouter();
  const [preview, setPreview] = useState(null);
  const [photoSuccess, setPhotoSuccess] = useState(false);
  const [videoSuccess, setVideoSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [isPendingPhoto, startPhoto] = useTransition();
  const [isPendingVideo, startVideo] = useTransition();
  const fileRef = useRef(null);
  const videoRef = useRef(null);

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) { setPreview(null); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);
    setPhotoSuccess(false);
    setError(null);
  }

  function handlePhotoSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    setError(null);
    startPhoto(async () => {
      try {
        await uploadAction(fd);
        setPreview(null);
        setPhotoSuccess(true);
        if (fileRef.current) fileRef.current.value = "";
        router.refresh();
        setTimeout(() => setPhotoSuccess(false), 3000);
      } catch (err) {
        setError(err.message || "Erreur lors de l'upload.");
      }
    });
  }

  function handleVideoSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    setError(null);
    startVideo(async () => {
      try {
        await addVideoAction(fd);
        setVideoSuccess(true);
        if (videoRef.current) videoRef.current.value = "";
        router.refresh();
        setTimeout(() => setVideoSuccess(false), 3000);
      } catch (err) {
        setError(err.message || "Erreur lors de l'ajout de la vidéo.");
      }
    });
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handlePhotoSubmit} className="space-y-2">
        <div className="flex gap-2 items-center">
          <label className="flex-1 flex items-center gap-3 cursor-pointer rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-600 hover:border-lotus-400 transition">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="aperçu" className="w-10 h-10 object-cover rounded" />
            ) : (
              <span className="text-stone-400">🖼 Choisir une photo…</span>
            )}
            <input ref={fileRef} type="file" name="photo" accept="image/*" required
              onChange={handleFileChange} className="sr-only" />
          </label>
          <button type="submit" disabled={isPendingPhoto || !preview}
            className="rounded-full bg-lotus-600 text-white text-sm font-medium px-4 py-2 hover:bg-lotus-700 transition disabled:opacity-50 whitespace-nowrap">
            {isPendingPhoto ? "Envoi…" : "Ajouter photo"}
          </button>
        </div>
        {photoSuccess && <p className="text-sm text-lotus-700">✓ Photo ajoutée avec succès</p>}
      </form>

      <form onSubmit={handleVideoSubmit} className="space-y-2">
        <div className="flex gap-2">
          <input ref={videoRef} type="url" name="video_url"
            placeholder="URL YouTube (ex. https://youtu.be/...)"
            className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lotus-500" />
          <button type="submit" disabled={isPendingVideo}
            className="rounded-full bg-stone-600 text-white text-sm font-medium px-4 py-2 hover:bg-stone-700 transition disabled:opacity-50 whitespace-nowrap">
            {isPendingVideo ? "Envoi…" : "Ajouter vidéo"}
          </button>
        </div>
        {videoSuccess && <p className="text-sm text-lotus-700">✓ Vidéo ajoutée avec succès</p>}
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
