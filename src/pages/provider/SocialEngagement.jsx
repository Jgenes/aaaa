import React, { useState, useEffect } from 'react';
import ProviderDashboardLayout from './layouts/ProviderDashboardLayout';
import api from "../../api/axio";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaWhatsapp, FaCopy } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import '../../App.css';

export default function SocialEngagement() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    const getBtnStyle = (color) => ({
        backgroundColor: color,
        color: 'white',
        border: 'none',
        width: '45px',
        height: '45px',
        borderRadius: '10px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s ease',
        fontSize: '18px',
    });

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await api.get('/provider/reports/courses-list');
                const data = response.data.courses || response.data;
                setCourses(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Error fetching courses:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const shareCourse = (platform, course) => {
        const baseUrl = window.location.origin; 
        const rawUrl = `${baseUrl}/training/${course.id}`;
        const url = encodeURIComponent(rawUrl);
        const text = encodeURIComponent(`Karibu kwenye mafunzo ya ${course.title || course.course_name}. Jisajili sasa!`);
        
        const links = {
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
            twitter: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
            whatsapp: `https://api.whatsapp.com/send?text=${text}%20${url}`,
            instagram: `https://www.instagram.com/`,
            copy: rawUrl
        };

        if (platform === 'copy') {
            navigator.clipboard.writeText(rawUrl);
            alert("Link copied to clipboard!");
        } else {
            window.open(links[platform], '_blank', 'width=600,height=400');
        }
    };

    return (
        <ProviderDashboardLayout title="Social Engagement Hub">
            <div style={{ padding: '30px', minHeight: '100vh' }}>
                
                <div style={{ marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
                    <p style={{ color: '#666', marginTop: '0px', fontSize: '13px' }}>Engage your cohorts by promoting courses across all platforms.</p>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '100px', color: '#666' }}>Loading...</div>
                ) : (
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
                        gap: '20px' 
                    }}>
                        {courses.length > 0 ? courses.map((course) => (
                            <div key={course.id} style={{ 
                                backgroundColor: 'white', 
                                borderRadius: '12px', 
                                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                                border: '1px solid #eee',
                                overflow: 'hidden'
                            }}>
                                <div style={{ padding: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                        <h3 style={{ margin: 0, fontSize: '14px', color: '#333' }}>
                                            {course.title || course.course_name}
                                        </h3>
                                        <span style={{ fontSize: '12px', color: '#999' }}>#{course.id}</span>
                                    </div>
                                    
                                    <div style={{ 
                                        margin: '20px 0', 
                                        padding: '15px 0', 
                                        borderTop: '1px solid #f9f9f9',
                                        borderBottom: '1px solid #f9f9f9' 
                                    }}>
                                        <p style={{ fontSize: '10px', color: '#999', marginBottom: '12px', textTransform: 'uppercase' }}>
                                            Promote Training
                                        </p>
                                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                            <button className='btnAA' onClick={() => shareCourse('facebook', course)} style={getBtnStyle('#1877F2')} title="Facebook"><FaFacebookF /></button>
                                            <button className='btnAA' onClick={() => shareCourse('twitter', course)} style={getBtnStyle('#000')} title="X"><FaXTwitter /></button>
                                            <button className='btnAA' onClick={() => shareCourse('instagram', course)} style={getBtnStyle('#E4405F')} title="Instagram"><FaInstagram /></button>
                                            <button className='btnAA' onClick={() => shareCourse('linkedin', course)} style={getBtnStyle('#0A66C2')} title="LinkedIn"><FaLinkedinIn /></button>
                                            <button className='btnAA' onClick={() => shareCourse('whatsapp', course)} style={getBtnStyle('#25D366')} title="WhatsApp"><FaWhatsapp /></button>
                                            <button className='btnAA' onClick={() => shareCourse('copy', course)} style={getBtnStyle('#6c757d')} title="Copy Link"><FaCopy /></button>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <div style={{ flex: 1, textAlign: 'center', background: '#fbfbfb', padding: '8px', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
                                            <div style={{ fontSize: '10px', color: '#999' }}>STATUS</div>
                                            <div style={{ fontSize: '12px', color: '#28a745' }}>{course.status || 'Active'}</div>
                                        </div>
                                        <div style={{ flex: 1, textAlign: 'center', background: '#fbfbfb', padding: '8px', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
                                            <div style={{ fontSize: '10px', color: '#999' }}>COHORT</div>
                                            <div style={{ fontSize: '12px', color: '#333' }}>{course.cohorts_count || 1} Active</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '50px', background: '#fff' }}>
                                <p>No courses found.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </ProviderDashboardLayout>
    );
}