import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import "../../styles/LearnCourse.css";

export default function LearnCourse() {
    const { courseId } = useParams();
    const { token } = useSelector((state) => state.auth);
    const [enrollment, setEnrollment] = useState(null);
    const [currentLesson, setCurrentLesson] = useState(null);
    const videoRef = useRef(null);

    useEffect(() => {
        const fetchEnrollment = async () => {
            const res = await axios.get(`http://localhost:5000/api/enrollments/my`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = res.data.find((e) => e.course._id === courseId);
            setEnrollment(data);
            const firstLesson = data.course.modules[0]?.lessons[0];
            setCurrentLesson(firstLesson);
        };

        fetchEnrollment();
    }, [courseId, token]);

    const updateProgress = async (isCompleted = false) => {
        if (!currentLesson || !enrollment) return;
        const watchedDuration = videoRef.current?.currentTime || 0;

        try {
            await axios.put(
                `http://localhost:5000/api/enrollments/${enrollment._id}/progress`,
                {
                    lessonId: currentLesson._id,
                    watchedDuration,
                    isCompleted,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // ✅ Update state immutably — trigger React re-render
            setEnrollment((prev) => {
                if (!prev) return prev;

                const updatedProgress = prev.progress ? [...prev.progress] : [];
                const existingIndex = updatedProgress.findIndex(
                    (p) => p.lessonId === currentLesson._id
                );

                if (existingIndex !== -1) {
                    // create a new object for React to detect changes
                    updatedProgress[existingIndex] = {
                        ...updatedProgress[existingIndex],
                        isCompleted,
                        watchedDuration,
                    };
                } else {
                    updatedProgress.push({
                        lessonId: currentLesson._id,
                        isCompleted,
                        watchedDuration,
                    });
                }

                // ✅ return a completely new enrollment object
                return {
                    ...prev,
                    progress: updatedProgress,
                };
            });
        } catch (err) {
            console.error("Progress update failed:", err);
        }
    };


    if (!enrollment || !currentLesson) return <p>Loading...</p>;

    return (
        <div className="learn-container">
            {/* Sidebar */}
            <aside className="sidebar">
                <h2 className="course-title">{enrollment.course.title}</h2>
                <div className="module-list">
                    {enrollment.course.modules.map((mod) => (
                        <div key={mod._id} className="module">
                            <h4 className="module-title">{mod.title}</h4>
                            <div className="lesson-list">
                                {mod.lessons.map((l) => {
                                    const lessonProgress = enrollment.progress?.find(
                                        (p) => p.lessonId === l._id
                                    );
                                    const done = lessonProgress?.isCompleted === true;

                                    return (
                                        <div
                                            key={l._id}
                                            className={`lesson-item ${l._id === currentLesson._id ? "active" : ""
                                                } ${done ? "completed" : ""}`}
                                            onClick={() => setCurrentLesson(l)}
                                        >
                                            {done ? "✅" : "▶"} {l.title}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </aside>

            {/* Main Content */}
            <main className="video-section">
                <div className="video-header">
                    <h2>{currentLesson.title}</h2>
                    <p className="lesson-desc">{currentLesson.description}</p>
                </div>

                <video
                    ref={videoRef}
                    src={currentLesson.videoUrl}
                    controls
                    onTimeUpdate={() => updateProgress(false)}
                    onEnded={() => updateProgress(true)}
                    className="video-player"
                />
            </main>
        </div>
    );
}
