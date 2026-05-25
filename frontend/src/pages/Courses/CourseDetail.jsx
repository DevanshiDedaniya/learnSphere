import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../api/axiosConfig";
import { useNavigate } from "react-router-dom";
//import { useDispatch } from "react-redux";
//import { issueCertificate } from "../../features/certificate/certificateSlice";
import "../../styles/CourseDetail.css";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  useStripe,
  useElements,
  CardElement,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  "pk_test_51SNBt308wHrZ3eocyeN8BithC2tV8xpJzWdacyjiY9zt3PoBt26OnE61uRg2jo7ZhqNBcyrCE5nvd4aFTsIm6d0Y00aALMhzp9",
);

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [paymentId, setPaymentId] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  //const dispatch = useDispatch();
  //const [enrollments, setEnrollments] = useState([]);
  //const [loadingIssue, setLoadingIssue] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const courseRes = await API.get(`/courses/${id}`);
        setCourse(courseRes.data?.data);

        if (token) {
          const userRes = await API.get("/auth/profile");
          setUser(userRes.data?.data);

          const enrollRes = await API.get("/enrollments/my");
          const enrollData = enrollRes.data?.data;
          const enrolled = (enrollData?.enrollments || []).some(
            (enr) => enr.course._id === id,
          );
          setIsEnrolled(enrolled);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, [id, token]);

  const handleEnrollClick = async () => {
    console.log("course id:", id);
    const res = await API.post(`/payments/create-intent/${id}`);
    const data = res.data?.data;

    setClientSecret(data?.clientSecret);
    setPaymentId(data?.paymentId);
    setShowPaymentForm(true);
  };

  const handleRatingSubmit = async () => {
    if (!userRating) {
      alert("Please select a rating before submitting.");
      return;
    }

    try {
      const res = await API.post(`/courses/rate/${id}`, { rating: userRating });

      alert(res.data?.message);

      const updated = await API.get(`/courses/${id}`);
      setCourse(updated.data?.data);
    } catch (err) {
      console.error("Rating error:", err);
      alert(err.response?.data?.message || "Error submitting rating");
    }
  };

  // const handleIssueCertificate = async (enrollmentId) => {
  //   try {
  //     setLoadingIssue(true);
  //     await dispatch(issueCertificate(enrollmentId)).unwrap();
  //     alert("✅ Certificate issued successfully!");
  //   } catch (err) {
  //     console.error("Issue error:", err);
  //     alert(err?.message || "Failed to issue certificate");
  //   } finally {
  //     setLoadingIssue(false);
  //   }
  // };

  if (!course) return <p>Loading course details...</p>;

  return (
    <div className="course-detail-container">
      <div className="course-detail-shell">
        {course.thumbnail && (
          <div className="course-hero">
            <img
              src={course.thumbnail}
              alt={course.title}
              className="course-thumb"
              onError={(e) => (e.target.style.display = "none")}
            />
          </div>
        )}
        <div className="course-detail-body">
          <h1>
            <b>{course.title}</b>
          </h1>
          <p>{course.description}</p>
          <br></br>
          {/* <div className="rating-section">
        <h3><b>Rating</b></h3>
        {course.averageRating ? (
          <p>⭐ {course.averageRating.toFixed(1)} / 5 ({course.ratedBy?.length || 0} ratings)</p>
        ) : (
          <p>No ratings yet</p>
        )}
      </div> */}

          <div className="course-meta">
            <p>
              <b>Instructor:</b> {course?.instructor?.fullName || "N/A"}
            </p>
            <p>
              <b>Email:</b> {course?.instructor?.email || "N/A"}
            </p>
            <p>
              <b>Category:</b> {course?.category || "N/A"}
            </p>
            <p>
              <b>Level:</b> {course?.level || "N/A"}
            </p>
            <p>
              <b>Price:</b> ₹{course?.price}
            </p>
            <p>
              <b>Duration:</b> {course?.courseDuration} mins
            </p>
            <p>
              <b>Total Students Enrolled:</b> {course?.totalStudents || 0}
            </p>
          </div>

          <div className="skills-section">
            <h3>
              <b>Skills Gained</b>
            </h3>
            {course.skills_gain?.length ? (
              <ul>
                {course.skills_gain.map((skill, i) => (
                  <li key={i}>{skill}</li>
                ))}
              </ul>
            ) : (
              <p>No skills listed</p>
            )}
          </div>

          <div className="tags-section">
            <h3>
              <b>Tags</b>
            </h3>
            {course.tags?.length ? (
              <div className="tags-container">
                {course.tags.map((tag, i) => (
                  <span key={i} className="tag-item">
                    #{tag}
                  </span>
                ))}
              </div>
            ) : (
              <p>No tags available</p>
            )}
          </div>
          {user?.role === "student" && isEnrolled && (
            <div className="rate-course">
              <h4>
                <b>Rate this course:</b>
              </h4>
              <div className="stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`star ${(hoverRating || userRating) >= star ? "active" : ""}`}
                    onClick={() => setUserRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                  >
                    ★
                  </span>
                ))}
              </div>
              <button
                className="submit-rating-btn"
                onClick={handleRatingSubmit}
                disabled={userRating === 0}
              >
                Submit Rating
              </button>
            </div>
          )}

          <hr style={{ margin: "20px 0" }} />

          <div style={{ marginTop: "20px", textAlign: "left" }}>
            {user?.role === "student" && !isEnrolled && !showPaymentForm && (
              <button className="enroll-btn" onClick={handleEnrollClick}>
                Enroll Now ₹{course.price}
              </button>
            )}

            {user?.role === "student" && isEnrolled && (
              <button
                className="enroll-btn"
                onClick={() => navigate(`/learn/${course._id}`)}
              >
                ▶️ Continue Learning
              </button>
            )}
          </div>

          {/* ✅ Show Stripe Payment Form */}
          {showPaymentForm && clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CardPaymentForm
                clientSecret={clientSecret}
                courseId={id}
                paymentId={paymentId}
              />
            </Elements>
          )}

          <hr style={{ margin: "20px 0" }} />

          <h2>
            <b>Modules</b>
          </h2>

          {/* {user?.role === "instructor" && (
        <div className="instructor-issue-section">
          <h2><b>🎓 Issue Certificates</b></h2>

          {enrollments.length > 0 ? (
            enrollments.map((enr) => (
              <div key={enr._id} className="enrollment-row">
                <div>
                  <p><b>{enr.student.fullName}</b></p>
                  <p>{enr.student.email}</p>
                </div>
                <div>
                  {enr.status === "completed" ? (
                    <button
                      onClick={() => handleIssueCertificate(enr._id)}
                      disabled={loadingIssue}
                      className="issue-btn"
                    >
                      {loadingIssue ? "Issuing..." : "Issue Certificate"}
                    </button>
                  ) : (
                    <span className="not-completed">Not Completed</span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p>No enrollments found for this course.</p>
          )}
        </div>
      )} */}

          {course.modules?.length ? (
            course.modules.map((mod, i) => (
              <div key={i} className="module-card">
                <h4>{mod.title}</h4>
                <p>{mod.description}</p>
                {mod.lessons?.map((lesson, j) => (
                  <div key={j} className="lesson-card">
                    <h5>{lesson.title}</h5>
                    <p>{lesson.description}</p>
                    {lesson.duration && (
                      <p>
                        <b>Duration:</b> {lesson.duration} mins
                      </p>
                    )}
                    {lesson.videoUrl && (
                      <video src={lesson.videoUrl} controls width="100%" />
                    )}
                  </div>
                ))}
              </div>
            ))
          ) : (
            <p>No modules available</p>
          )}
        </div>
      </div>
    </div>
  );
}

function CardPaymentForm({ clientSecret, courseId, paymentId }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);

    const cardElement = elements.getElement(CardElement);

    const { error, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: { card: cardElement },
      },
    );

    if (error) {
      alert(error.message);
      setIsProcessing(false);
      return;
    }

    if (paymentIntent.status === "succeeded") {
      await API.post(`/enrollments/${courseId}`, { paymentId });

      alert("Payment successful & Enrollment completed!");

      navigate("/student/dashboard");
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <CardElement />
      <button disabled={!stripe || isProcessing}>
        {isProcessing ? "Processing..." : "Pay Now"}
      </button>
    </form>
  );
}
