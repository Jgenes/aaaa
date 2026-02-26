import React, { useState } from "react";
import { FaStar } from "react-icons/fa";
import api from "../api/axio";
import { toast } from "react-toastify";

export default function ReviewModal({ courseId, onClose }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      return toast.warning("Tafadhali chagua nyota angalau moja!");
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      await api.post(
        "/reviews", 
        { 
          course_id: courseId, 
          rating: rating, 
          comment: comment 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Asante kwa maoni yako!");
      onClose(); // Funga modal baada ya kufanikiwa
    } catch (error) {
      console.error("Review Error:", error);
      toast.error("Imeshindwa kutuma review. Jaribu tena.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="modal fade show d-block" 
      tabIndex="-1" 
      style={{ backgroundColor: "rgba(0,0,0,0.7)", zIndex: 2000 }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "15px" }}>
          
          <div className="modal-header border-0 pe-4 pt-4">
            <h5 style={{fontSize:"14px"}} className="modal-title fw-bold">Rate this training</h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onClose}
              disabled={isSubmitting}
            ></button>
          </div>

          <div className="modal-body text-center px-4 pb-4">
            <p className="text-secondary small mb-4">
              Your feedback helps us improve and helps other students.
            </p>

            {/* Star Rating System */}
            <div className="d-flex justify-content-center gap-2 mb-4">
              {[...Array(5)].map((_, i) => {
                const ratingValue = i + 1;
                return (
                  <label key={i} style={{ cursor: "pointer" }}>
                    <input
                      type="radio"
                      name="rating"
                      value={ratingValue}
                      className="d-none"
                      onClick={() => setRating(ratingValue)}
                    />
                    <FaStar
                      size={42}
                      style={{ transition: "0.2s" }}
                      color={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
                      onMouseEnter={() => setHover(ratingValue)}
                      onMouseLeave={() => setHover(0)}
                    />
                  </label>
                );
              })}
            </div>

            {/* Comment Area */}
            <div className="text-start mb-3">
              <label className="form-label small fw-bold text-muted">Review Comment (Optional)</label>
              <textarea
                className="form-control bg-light border-0"
                rows="4"
                placeholder="What did you like or dislike about this course?"
                style={{ borderRadius: "10px", fontSize: "14px" }}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              ></textarea>
            </div>
          </div>

          <div className="modal-footer border-0 px-4 pb-4">
            <button 
              type="button" 
              className="btn btn-light px-4 border-0" 
              onClick={onClose}
              disabled={isSubmitting}
              style={{ borderRadius: "8px", fontWeight: "500", fontSize:"13px" }}
            >
              Maybe Later
            </button>
            <button 
  type="button" 
  className="btn px-4 shadow-sm submitReview" // Nimeondoa btn-primary ili isilete mgongano wa rangi
  onClick={handleSubmit}
  disabled={isSubmitting}
  style={{ 
    borderRadius: "8px", 
    fontWeight: "500", 
    backgroundColor: "#0a2e67", // Nimeondoa semicolon hapa
    color: "white",
    fontSize:"13px",
    border: "none" // Inasaidia rangi yako itokee vizuri bila border ya kigeni
  }}
>
  {isSubmitting ? (
    <>
      <span className="spinner-border spinner-border-sm me-2"></span>
      Sending...
    </>
  ) : (
    "Submit Review"
  )}
</button>
          </div>
          
        </div>
      </div>
    </div>
  );
}