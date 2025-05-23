import { useRef, useEffect, useState } from "react";

export default function HotelSwapIsland() {
  const hoteles = [
    {
      name: "Exe Gran Hotel Almenar",
      link: "https://www.eurostarshotels.com/exe-gran-hotel-almenar.html",
      phone: "916 308 128",
      address: "C. Jaraíz, 1, 28290 Las Rozas de Madrid, Madrid",
      mapsLink: "https://g.co/kgs/CB7GPB3",
      distanceFromVenue: "15 minutos en coche.",
      note: "Hemos cerrado un acuerdo con el hotel para que, si al hacer la reserva mencionáis que asistís a nuestra boda, os apliquen un 15% de descuento. ¡Ya está confirmado!",
      transport: "Hay Uber, Cabify y taxis disponibles desde la finca para facilitar el desplazamiento.",
      destacado: "✨ ¡Con 15% de descuento!",
    },
    {
      name: "Hotel Pax Torrelodones",
      link: "https://www.hotelpaxtorrelodones.com/",
      phone: "918 406 606",
      address: "C. de Ribadeo, s/n, 28250 Torrelodones, Madrid",
      mapsLink: "https://g.co/kgs/6hNNLWB",
      distanceFromVenue: "10 minutos en coche.",
      note: "Este hotel está más cerca de la finca, aunque no dispone de descuento para bodas.",
      transport: "También dispone de Uber, Cabify y taxis para el traslado.",
      destacado: "📍 Más cercano a la finca",
    },
  ];

  const [index, setIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Detectar scroll y actualizar el índice
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      const scrollLeft = el.scrollLeft;
      const width = el.clientWidth;
      const newIndex = Math.round(scrollLeft / width);
      setIndex(newIndex);
    };

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  // Ir a tarjeta con click en dot
  const scrollToIndex = (i: number) => {
    scrollRef.current?.scrollTo({
      left: i * scrollRef.current.clientWidth,
      behavior: "smooth",
    });
  };

  return (
    <section className="bg-base-100 py-12 scroll-mt-10">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <h3 className="text-3xl font-bold text-stone-800 mb-6">🏨 Alojamientos recomendados</h3>

        <div
          ref={scrollRef}
          className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth rounded-2xl shadow-md"
        >
          {hoteles.map((hotel, i) => (
            <div
              key={hotel.name}
              className="min-w-full snap-start bg-neutral-100 px-6 py-6 text-left space-y-4"
            >
              <div className="flex justify-between items-center">
                <h4 className="text-xl font-semibold text-stone-800">{hotel.name}</h4>
                <span className="text-sm text-amber-600 font-medium">{hotel.destacado}</span>
              </div>

              <p className="text-stone-700">{hotel.note}</p>

              <p className="text-stone-700">
                Dirección:{" "}
                <a
                  href={hotel.mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-500 hover:underline"
                >
                  {hotel.address}
                </a>
              </p>

              <p className="text-stone-700">
                Teléfono:{" "}
                <a href={`tel:${hotel.phone}`} className="text-primary-500 hover:underline">
                  {hotel.phone}
                </a>
              </p>

              <p className="text-stone-700">Distancia desde la finca: {hotel.distanceFromVenue}</p>
              <p className="text-stone-700">{hotel.transport}</p>

              <a
                href={hotel.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 text-primary-500 hover:underline font-medium"
              >
                Ver sitio web →
              </a>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-center gap-4">
          {hoteles.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToIndex(i)}
              className={`w-3 h-3 rounded-full ${
                index === i ? "bg-primary-500" : "bg-stone-300"
              } transition-all`}
              aria-label={`Ver hotel ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
