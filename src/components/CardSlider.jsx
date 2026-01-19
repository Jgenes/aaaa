import { useEffect, useState } from "react";
import Career from "../assets/carrer.png";
import PDPC from "../assets/pdpc.png";
import Nacte from "../assets/NACTE.png";
import TCU from "../assets/TCU.png";
import TTCII from "../assets/TTCII.png";
import UDSM from "../assets/udsm.jpg";
import VETA from "../assets/VETA.png";
import OSHA from "../assets/OSHA.png";
const data = [
  { title: "Personal Data Protection Committee", img: PDPC },
  { title: "National Council for Technical Education", img: Nacte },
  { title: "Tanzania Commision for Universities", img: TCU },
  { title: "Tanzanian Training Centre for International Health", img: TTCII },
  { title: "The University of Dar es Salaam", img: UDSM },
  { title: "Vocational Education and Training", img: VETA },
  { title: "Occupational Safety and Health Authority", img: OSHA },
];

function CardSlider() {
  const [index, setIndex] = useState(0);
  const visibleCards = 6; // Number of cards visible at a time
  const cardWidth = 220; // width of card including gap

  // AUTO SLIDE
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev < data.length - visibleCards ? prev + 1 : 0));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container my-5 cardslider1">
      <h3 className="mb-3">Learn from leading universities & organizations</h3>

      <div className="overflow-hidden">
        <div
          className="d-flex gap-3"
          style={{
            transform: `translateX(-${index * cardWidth}px)`,
            transition: "transform 0.5s ease",
          }}
        >
          {data.map((item, i) => (
            <div
              key={i}
              className="card shadow-sm d-flex flex-row align-items-center p-2"
              style={{
                width: "200px",
                flexShrink: 0,
                height: "30px",
                paddingTop: "50px",
              }}
            >
              {/* Image left */}
              <img
                src={item.img}
                alt={item.title}
                style={{
                  width: "30px",
                  height: "30px",
                  objectFit: "contain",
                  marginRight: "10px",
                }}
              />
              {/* Text right */}
              <div className="card-body p-0">
                <h6 className="mb-0" style={{ fontSize: "10px" }}>
                  {item.title}
                </h6>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CardSlider;
