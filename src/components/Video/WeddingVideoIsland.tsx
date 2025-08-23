import { useEffect, useRef, useState } from "react";

export default function WeddingVideoIsland() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [likes, setLikes] = useState(Math.floor(Math.random() * 51) + 100);
  const [liked, setLiked] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && videoRef.current) {
          videoRef.current.pause();
          setPlaying(false);
        }
      },
      { threshold: 0.6 }
    );

    if (videoRef.current) observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, []);

  const handleLike = () => {
    if (!liked) {
      setLikes((prev) => prev + 1);
      setLiked(true);
      setTimeout(() => setLiked(false), 1500);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
      setPlaying(false);
    } else {
      videoRef.current.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  return (
    <div className="flex justify-center my-12">
      <div className="relative w-[300px] sm:w-[360px] h-[600px] rounded-2xl shadow-xl border border-stone-300 bg-white overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center px-4 py-3 border-b border-stone-200 bg-white">
          <div className="relative w-10 h-10">
            <img
              src="/images/noeliarosell1999.jpg"
              alt="Noelia"
              className="absolute left-0 top-0 w-6 h-6 rounded-full border-2 border-white object-cover z-10"
            />
            <img
              src="/images/juanhosk.jpg"
              alt="Juanjo"
              className="absolute left-3 top-0 w-6 h-6 rounded-full border-2 border-white object-cover z-0"
            />
          </div>
          <span className="text-sm font-semibold ml-5">
        
            noeliarosell1999 y juanhosk
          </span>
        </div>

        {/* Video */}
        <div 
        className="relative w-full grow bg-black cursor-pointer min-h-[420px]"
          onClick={togglePlay}
        >
          <video
            ref={videoRef}
            src="/videos/boda.mp4"
            className={`w-full h-full object-cover object-center transition-opacity duration-300 ${
              playing ? "opacity-100" : "opacity-70"
            }`}
            playsInline
            loop
            preload="metadata"
            // No muted → se escuchará tras play
          />

          {/* Show button only when paused */}
          {!playing && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-4xl bg-black bg-opacity-40 rounded-full w-14 h-14 flex items-center justify-center"
              title="Play"
            >
              ▶
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center px-4 py-3 gap-5 border-t border-stone-200 bg-white z-10">
          <button
            onClick={handleLike}
            title="Me gusta"
            className={`text-xl transition-transform ${
              liked ? "scale-125 text-red-500" : "text-stone-700"
            }`}
          >
            {liked ? "❤️" : "🤍"}
          </button>
          <span className="text-xl">💬</span>
          <span className="text-xl">✉️</span>
          <span className="ml-auto text-sm text-stone-500">{likes} Me gusta</span>
        </div>
      </div>
    </div>
  );
}
