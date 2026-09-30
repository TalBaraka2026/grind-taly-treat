import React, { useEffect, useState, useRef } from 'react';

export default function CountdownTimer({ expiresAt, onExpire, className = '' }) {
  const [remaining, setRemaining] = useState(0);
  const firedRef = useRef(false);

  useEffect(() => {
    firedRef.current = false;
    const compute = () => {
      const secs = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
      setRemaining(secs);
      if (secs <= 0 && !firedRef.current) {
        firedRef.current = true;
        onExpire && onExpire();
      }
    };
    compute();
    const interval = setInterval(compute, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');

  return (
    <div className={className} dir="ltr">
      {mm}:{ss}
    </div>
  );
}