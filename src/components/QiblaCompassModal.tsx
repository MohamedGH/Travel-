import React, { useState, useEffect } from 'react';
import { X, Compass, Navigation, MapPin, RefreshCw } from 'lucide-react';

interface QiblaCompassModalProps {
  isOpen: boolean;
  onClose: () => void;
  locationName: string;
  qiblaBearing: number; // degrees from true North
}

export const QiblaCompassModal: React.FC<QiblaCompassModalProps> = ({
  isOpen,
  onClose,
  locationName,
  qiblaBearing,
}) => {
  const [deviceHeading, setDeviceHeading] = useState<number | null>(null);
  const [hasCompassSupport, setHasCompassSupport] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Listen to device orientation if available on mobile
    const handleOrientation = (e: DeviceOrientationEvent) => {
      // @ts-ignore
      const heading = e.webkitCompassHeading || (e.alpha ? 360 - e.alpha : null);
      if (heading !== null && heading !== undefined) {
        setDeviceHeading(Math.round(heading));
        setHasCompassSupport(true);
      }
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Relative angle to Kaaba if compass heading is known
  const relativeAngle = deviceHeading !== null ? (qiblaBearing - deviceHeading + 360) % 360 : qiblaBearing;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full border border-stone-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-teal-400" />
            <h3 className="font-bold text-sm sm:text-base">Boussole Qibla (La Mecque)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 text-center space-y-6">
          <div className="flex items-center justify-center gap-1.5 text-xs text-stone-600 bg-stone-100 py-1.5 px-3 rounded-full mx-auto w-fit">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-semibold">{locationName}</span>
          </div>

          {/* Compass Dial Visual */}
          <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
            {/* Outer Compass Rose */}
            <div className="absolute inset-0 rounded-full border-4 border-stone-200 shadow-inner flex items-center justify-center bg-gradient-to-b from-stone-50 to-stone-100">
              {/* Cardinal Markers */}
              <span className="absolute top-2 font-bold text-xs text-red-600">N (0°)</span>
              <span className="absolute right-3 font-bold text-xs text-stone-600">E (90°)</span>
              <span className="absolute bottom-2 font-bold text-xs text-stone-600">S (180°)</span>
              <span className="absolute left-2 font-bold text-xs text-stone-600">O (270°)</span>

              {/* Degrees Tick Marks */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                <div
                  key={deg}
                  className="absolute w-full h-full flex justify-center items-start pointer-events-none"
                  style={{ transform: `rotate(${deg}deg)` }}
                >
                  <div className="w-0.5 h-2 bg-stone-300 mt-5" />
                </div>
              ))}
            </div>

            {/* Qibla Indicator Needle */}
            <div
              className="absolute inset-0 flex items-center justify-center transition-transform duration-300 ease-out pointer-events-none"
              style={{ transform: `rotate(${relativeAngle}deg)` }}
            >
              {/* Arrow pointing towards Kaaba */}
              <div className="flex flex-col items-center justify-start h-full pt-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-md font-bold text-xs border-2 border-white">
                  🕋
                </div>
                <div className="w-1.5 h-20 bg-gradient-to-b from-emerald-600 to-transparent rounded-full mt-1" />
              </div>
            </div>

            {/* Center Pivot */}
            <div className="w-6 h-6 rounded-full bg-stone-900 border-2 border-white shadow-md z-10 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
          </div>

          {/* Bearing Details */}
          <div className="space-y-1">
            <div className="text-3xl font-black text-stone-900 tracking-tight">
              {qiblaBearing}°
            </div>
            <p className="text-xs text-stone-500 font-medium">
              Angle de relèvement depuis le Nord géographique
            </p>
            {hasCompassSupport && deviceHeading !== null && (
              <p className="text-xs text-emerald-700 font-semibold mt-1">
                Orientation de votre appareil : {deviceHeading}°
              </p>
            )}
          </div>

          {/* Guidance note */}
          <div className="p-3 bg-stone-50 rounded-xl text-left border border-stone-200 text-xs text-stone-600 space-y-1">
            <p className="font-semibold text-stone-800">
              💡 Astuce en train, avion ou bateau :
            </p>
            <p className="leading-relaxed">
              Orientez-vous vers {qiblaBearing}° lors du Takbir d'entrée en prière. En déplacement rapide, faites de votre mieux pour maintenir cette direction générale sans interrompre votre prière.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
