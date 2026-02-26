import React, { useState, useEffect } from 'react';
import ProviderDashboardLayout from "./layouts/ProviderDashboardLayout.jsx";
import api from "../../api/axio";
import { FaStar, FaUserCircle, FaTrophy } from 'react-icons/fa';

export default function ProviderReview() {
    const [data, setData] = useState({ reviews: [], stats: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await api.get('/provider/reviews');
                setData(response.data);
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, []);

    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <FaStar key={i} color={i < Math.round(rating) ? "#ffc107" : "#e4e5e9"} size={14} />
        ));
    };

    return (
        <ProviderDashboardLayout title="Review Center">
            <div style={{ padding: '30px' }}>
                
                {/* 1. Header Section */}
                

                {!loading && (
                    <>
                        {/* 2. Summary Cards per Course */}
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
                            gap: '20px', 
                            marginBottom: '40px' 
                        }}>
                            {data.stats.map(stat => (
                                <div key={stat.id} style={{ 
                                    background: 'white', padding: '20px', borderRadius: '15px', 
                                    border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                                }}>
                                    <div style={{ color: '#a0aec0', fontSize: '11px', textTransform: 'uppercase' }}>Course Rating</div>
                                    <div style={{ fontSize: '16px', margin: '5px 0' }}>{stat.title}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ fontSize: '24px' }}>{stat.avg_rating}</span>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <div style={{ display: 'flex' }}>{renderStars(stat.avg_rating)}</div>
                                            <span style={{ fontSize: '11px', color: '#718096' }}>{stat.total_reviews} reviews</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 3. Detailed Reviews List */}
                        {/* <h3 style={{ fontSize: '20px', marginBottom: '20px', color: '#2d3748' }}>Latest Feedback</h3> */}
                        {data.reviews.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {data.reviews.map((review) => (
                                    <div key={review.id} style={{
                                        backgroundColor: 'white', padding: '20px', borderRadius: '12px',
                                        border: '1px solid #edf2f7'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                <FaUserCircle size={35} color="#cbd5e0" />
                                                <div>
                                                    <div style={{ fontSize: '15px' }}>{review.user?.name}</div>
                                                    <div style={{ fontSize: '12px', color: '#718096' }}>
                                                        On <span style={{ color: '#4a5568' }}>{review.course?.title}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '2px' }}>
                                                {renderStars(review.rating)}
                                            </div>
                                        </div>
                                        <p style={{ marginTop: '15px', color: '#4a5568', lineHeight: '1.6' }}>
                                            "{review.comment || "The student didn't leave a written comment."}"
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px', background: '#fff', borderRadius: '15px' }}>
                                <p>No feedback received yet.</p>
                            </div>
                        )}
                    </>
                )}

                {loading && <p>Syncing feedback data...</p>}
            </div>
        </ProviderDashboardLayout>
    );
}