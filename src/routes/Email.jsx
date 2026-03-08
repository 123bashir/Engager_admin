import React, { useState, useEffect, useRef } from "react";
import { FaPaperPlane, FaTimes, FaInbox, FaEnvelope, FaUser, FaPaperclip, FaTrash } from "react-icons/fa";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import { api } from "../utils/api";
import { useNotification } from "../context/NotificationContext";
import "./Email.css";

export default function Email({ onNavigate, activePage }) {
    const [composing, setComposing] = useState(false);
    const [sending, setSending] = useState(false);
    const [emailData, setEmailData] = useState({
        to: "",
        subject: "",
        body: ""
    });
    const [attachments, setAttachments] = useState([]);
    const fileInputRef = useRef(null);
    const { notify, notifySuccess, notifyError } = useNotification();

    // Popup State
    const [popup, setPopup] = useState({
        isOpen: false,
        type: 'success',
        message: '',
        showConfirm: false
    });

    const [sentEmails, setSentEmails] = useState([]);
    const [loadingEmails, setLoadingEmails] = useState(true);

    useEffect(() => {
        fetchSentEmails();
    }, []);

    const fetchSentEmails = async () => {
        try {
            setLoadingEmails(true);
            const response = await api.get('/email/sent');
            if (response.success) {
                setSentEmails(response.emails);
            }
        } catch (error) {
            console.error('Failed to fetch sent emails:', error);
        } finally {
            setLoadingEmails(false);
        }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);

        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAttachments(prev => [...prev, {
                    filename: file.name,
                    content: reader.result.split(',')[1], // Base64 content
                    encoding: 'base64'
                }]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeAttachment = (index) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleSend = async (e) => {
        e.preventDefault();
        setSending(true);

        try {
            // Validate recipient count (1-5)
            const recipients = emailData.to.split(',').map(email => email.trim()).filter(email => email);

            if (recipients.length === 0) {
                notifyError('Please enter at least one recipient email address.');
                setSending(false);
                return;
            }

            if (recipients.length > 5) {
                notifyError('Maximum 5 recipients allowed per email. Please reduce the number of recipients.');
                setSending(false);
                return;
            }

            // Call backend API
            const response = await api.post('/email/send', {
                ...emailData,
                attachments
            });

            if (response.success) {
                notifySuccess(response.message || 'Email sent successfully!');
                setEmailData({ to: "", subject: "", body: "" });
                setAttachments([]);
                setComposing(false);
                fetchSentEmails(); // Refresh sent emails list
            }
        } catch (error) {
            console.error('Email send error:', error);
            // Auto-notified by api.js
        } finally {
            setSending(false);
        }
    };

    const closePopup = () => {
        setPopup(prev => ({ ...prev, isOpen: false }));
    };

    return (
        <div>
            <Sidebar onNavigate={onNavigate} activePage={activePage} />
            <div className="dashboard-main">
                <Header />

                <main className="email-container">
                    {/* Email Header */}
                    <div className="email-header-section">
                        <div className="email-header-left">
                            <h1>
                                <FaEnvelope />
                                Email Center
                            </h1>
                            <p>Send professional emails to clients, staff, and stakeholders</p>
                        </div>
                        <button
                            className="btn-compose-email"
                            onClick={() => setComposing(!composing)}
                        >
                            {composing ? <><FaTimes /> Cancel</> : <><FaPaperPlane /> Compose Email</>}
                        </button>
                    </div>

                    {/* Compose Email Form */}
                    {composing && (
                        <div className="email-compose-section">
                            <h2>
                                <FaPaperPlane />
                                New Email
                            </h2>
                            <form onSubmit={handleSend} className="email-form">
                                <div className="email-form-group">
                                    <label htmlFor="to">
                                        <FaUser />
                                        To (separate multiple emails with commas):
                                    </label>
                                    <input
                                        type="text"
                                        id="to"
                                        value={emailData.to}
                                        onChange={(e) => setEmailData({ ...emailData, to: e.target.value })}
                                        placeholder="client@example.com, staff@greyinsaat.com (max 5 recipients)"
                                        required
                                    />
                                    <small style={{ color: '#64748b', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                        You can send to 1-5 recipients. Separate multiple emails with commas.
                                    </small>
                                </div>

                                <div className="email-form-group">
                                    <label htmlFor="subject">
                                        <FaEnvelope />
                                        Subject:
                                    </label>
                                    <input
                                        type="text"
                                        id="subject"
                                        value={emailData.subject}
                                        onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                                        placeholder="Enter email subject"
                                        required
                                    />
                                </div>

                                <div className="email-form-group">
                                    <label htmlFor="body">Message:</label>
                                    <textarea
                                        id="body"
                                        value={emailData.body}
                                        onChange={(e) => setEmailData({ ...emailData, body: e.target.value })}
                                        placeholder="Type your message here..."
                                        rows="12"
                                        required
                                    ></textarea>
                                </div>

                                {/* Attachments Section */}
                                <div className="email-form-group">
                                    <label>
                                        <FaPaperclip />
                                        Attachments:
                                    </label>
                                    <div className="file-upload-container">
                                        <input
                                            type="file"
                                            multiple
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            style={{ display: 'none' }}
                                        />
                                        <button
                                            type="button"
                                            className="btn-upload"
                                            onClick={() => fileInputRef.current.click()}
                                        >
                                            <FaPaperclip /> Add Files
                                        </button>

                                        {attachments.length > 0 && (
                                            <div className="attachments-list">
                                                {attachments.map((file, index) => (
                                                    <div key={index} className="attachment-item">
                                                        <span>{file.filename}</span>
                                                        <button
                                                            type="button"
                                                            className="btn-remove-attachment"
                                                            onClick={() => removeAttachment(index)}
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="email-form-actions">
                                    <button type="button" className="btn-cancel" onClick={() => setComposing(false)} disabled={sending}>
                                        <FaTimes />
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-send" disabled={sending}>
                                        {sending ? (
                                            <>Sending...</>
                                        ) : (
                                            <>
                                                <FaPaperPlane />
                                                Send Email
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Email History */}
                    <div className="email-history-section">
                        <h2>
                            <FaInbox />
                            Sent Emails
                        </h2>
                        {loadingEmails ? (
                            <p style={{ textAlign: 'center', color: '#718096', padding: '20px' }}>Loading emails...</p>
                        ) : sentEmails.length === 0 ? (
                            <p style={{ textAlign: 'center', color: '#718096', padding: '20px' }}>No sent emails yet</p>
                        ) : (
                            <div className="email-list">
                                {sentEmails.map(email => (
                                    <div key={email.id} className="email-item">
                                        <div className="email-item-icon">
                                            <FaEnvelope />
                                        </div>
                                        <div className="email-item-content">
                                            <div className="email-item-header">
                                                <h3>{email.subject}</h3>
                                                <span className="email-date">{new Date(email.sent_at).toLocaleDateString()}</span>
                                            </div>
                                            <p className="email-to">To: {email.recipients}</p>
                                            <p className="email-preview">{email.body.substring(0, 100)}...</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>

                <div className="dashboard-footer">
                    <Footer />
                </div>
            </div>
        </div>
    );
}
