import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../api/axio";

const RATING_LABELS = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very good",
  5: "Excellent",
};

export default function ReviewModal({ courseId, onClose }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape" && !isSubmitting) onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isSubmitting, onClose]);

  const handleSubmit = async () => {
    if (rating === 0) {
      return toast.warning("Please choose at least one star.");
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      await api.post(
        "/reviews",
        { course_id: courseId, rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Thank you for your feedback!");
      onClose();
    } catch (error) {
      console.error("Review Error:", error);
      toast.error("We could not submit your review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="modal fade show d-block"
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-modal-title"
      style={{ backgroundColor: "rgba(7, 27, 51, 0.6)", zIndex: 2000 }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="modal-title" id="review-modal-title">
              Rate this training
            </h2>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              disabled={isSubmitting}
              aria-label="Close review dialog"
            ></button>
          </div>

          <div className="modal-body">
            <p className="text-muted mb-4" style={{ fontSize: "var(--th-fs-sm)" }}>
              Your feedback helps us improve and helps other learners choose with confidence.
            </p>

            <fieldset className="text-center mb-4">
              <legend className="form-label w-100 text-center">
                Your rating
                {rating > 0 && (
                  <span className="text-muted fw-normal"> — {RATING_LABELS[rating]}</span>
                )}
              </legend>
              <div className="d-flex justify-content-center gap-2" role="radiogroup">
                {[1, 2, 3, 4, 5].map((value) => {
                  const filled = value <= (hover || rating);
                  return (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={rating === value}
                      aria-label={`${value} star${value > 1 ? "s" : ""} — ${RATING_LABELS[value]}`}
                      onClick={() => setRating(value)}
                      onMouseEnter={() => setHover(value)}
                      onMouseLeave={() => setHover(0)}
                      className="border-0 bg-transparent p-1"
                      style={{ lineHeight: 1 }}
                    >
                      <i
                        className={`bi ${filled ? "bi-star-fill" : "bi-star"}`}
                        style={{
                          fontSize: 30,
                          color: filled ? "var(--th-orange-500)" : "#cdd6e2",
                        }}
                        aria-hidden="true"
                      ></i>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div>
              <label className="form-label" htmlFor="review-comment">
                Review comment <span className="text-muted fw-normal">(optional)</span>
              </label>
              <textarea
                id="review-comment"
                className="form-control"
                rows="4"
                placeholder="What did you like or dislike about this course?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              ></textarea>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-outline-dark"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Maybe later
            </button>
            <button
              type="button"
              className={`btn btn-primary ${isSubmitting ? "is-loading" : ""}`}
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending…" : "Submit review"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
