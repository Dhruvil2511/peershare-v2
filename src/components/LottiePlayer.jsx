// LottiePlayer.jsx
import { useEffect, useRef, useState } from 'react';

export default function LottiePlayer({ animationData, className }) {
  const containerRef = useRef();
  const [lottie, setLottie] = useState(null);

  useEffect(() => {
    import('lottie-web/build/player/lottie_light').then((mod) => {
      setLottie(mod.default);
    });
  }, []);

  useEffect(() => {
    if (!lottie) return;
    const anim = lottie.loadAnimation({
      container: containerRef.current,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      animationData,
    });
    return () => anim.destroy();
  }, [lottie, animationData]);

  return <div ref={containerRef} className={className} />;
}
