import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SubmitProjectPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    projectName: '',
    country: '',
    industry: '',
    bitcoinOnchain: false,
    lightning: false,
    giftCards: false,
    description: '',
    website: '',
    email: '',
    twitter: '',
    linkedin: '',
    facebook: '',
    nostr: '',
    instagram: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.projectName.trim()) {
      newErrors.projectName = 'Project name is required';
    }
    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }
    if (!formData.industry.trim()) {
      newErrors.industry = 'Industry is required';
    }
    if (!formData.bitcoinOnchain && !formData.lightning && !formData.giftCards) {
      newErrors.bitcoinAcceptance = 'Please select at least one Bitcoin acceptance method';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Project description is required';
    }
    if (!formData.website.trim()) {
      newErrors.website = 'Website URL is required';
    } else if (!/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Please enter a valid URL (starting with http:// or https://)';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      const response = await fetch('/api/projects/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        navigate('/submit-success', { state: { projectName: formData.projectName } });
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to submit project. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting project:', error);
      navigate('/submit-success', { state: { projectName: formData.projectName } });
    }
  };

  const countries = [
    'Kenya',
    'Nigeria',
    'South Africa',
    'Ghana',
    'Tanzania',
    'Uganda',
    'Zambia',
    'Zimbabwe',
    'Botswana',
    'Senegal',
    'Benin',
    'Ethiopia',
    'Burundi',
    'Malawi',
    'Mozambique',
    'Namibia',
    'Sudan',
    'Togo',
    'Cameroon',
    'Ivory Coast',
    'Other',
  ];

  const industries = [
    'Conference',
    'Regular Meetups',
    'Media',
    'Business',
    'Tech Meetups',
    'Mining',
    'Retail',
    'Community',
    'Education',
    'Non Profit',
    'Circular Economy',
    'Hold',
    'Funding',
    'Other',
  ];

  return (
    <main className="app-main" style={{ background: '#F5F5F5', minHeight: '100vh', padding: '4rem 1rem' }}>
      <div className="container" style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ marginBottom: '3rem' }}>
          <h1
            style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              color: '#1F2937',
              marginBottom: '2rem',
              textAlign: 'center',
            }}
          >
            Steps to get listed
          </h1>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '2rem',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: '#FD5A47',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  margin: '0 auto 1rem',
                }}
              >
                1
              </div>
              <h3
                style={{
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  color: '#1F2937',
                  marginBottom: '0.5rem',
                }}
              >
                Submit Your Details
              </h3>
              <p style={{ fontSize: '0.9375rem', color: '#4B5563', lineHeight: 1.6, margin: 0 }}>
                Fill out the form below with comprehensive information about your project, including
                proof of Bitcoin acceptance and your circular economy goals.
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: '#FD5A47',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  margin: '0 auto 1rem',
                }}
              >
                2
              </div>
              <h3
                style={{
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  color: '#1F2937',
                  marginBottom: '0.5rem',
                }}
              >
                Internal Review & Authorization
              </h3>
              <p style={{ fontSize: '0.9375rem', color: '#4B5563', lineHeight: 1.6, margin: 0 }}>
                Our team reviews your submission to ensure it meets our guidelines and standards for
                Bitcoin-only projects.
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: '#FD5A47',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  margin: '0 auto 1rem',
                }}
              >
                3
              </div>
              <h3
                style={{
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  color: '#1F2937',
                  marginBottom: '0.5rem',
                }}
              >
                Go Live
              </h3>
              <p style={{ fontSize: '0.9375rem', color: '#4B5563', lineHeight: 1.6, margin: 0 }}>
                Once authorized, your listing instantly becomes visible on the directory map and
                search results.
              </p>
            </div>
          </div>
        </div>

        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '12px',
            padding: '3rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          }}
        >
          <h2
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#1F2937',
              marginBottom: '2rem',
            }}
          >
            Project Listing Form
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label
                htmlFor="projectName"
                style={{
                  display: 'block',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  color: '#1F2937',
                  marginBottom: '0.5rem',
                }}
              >
                Project / Business Name <span style={{ color: '#FD5A47' }}>*</span>
              </label>
              <input
                type="text"
                id="projectName"
                name="projectName"
                value={formData.projectName}
                onChange={handleChange}
                placeholder="e.g. African Bitcoiners"
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  fontSize: '1rem',
                  border: errors.projectName ? '2px solid #EF4444' : '1px solid #D1D5DB',
                  borderRadius: '8px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#FD5A47';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = errors.projectName ? '#EF4444' : '#D1D5DB';
                }}
              />
              {errors.projectName && (
                <p style={{ color: '#EF4444', fontSize: '0.875rem', marginTop: '0.25rem', margin: 0 }}>
                  {errors.projectName}
                </p>
              )}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1.5rem',
                marginBottom: '1.5rem',
              }}
            >
              <div>
                <label
                  htmlFor="country"
                  style={{
                    display: 'block',
                    fontSize: '0.9375rem',
                    fontWeight: 600,
                    color: '#1F2937',
                    marginBottom: '0.5rem',
                  }}
                >
                  Country of Operation <span style={{ color: '#FD5A47' }}>*</span>
                </label>
                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    fontSize: '1rem',
                    border: errors.country ? '2px solid #EF4444' : '1px solid #D1D5DB',
                    borderRadius: '8px',
                    outline: 'none',
                    background: '#FFFFFF',
                    cursor: 'pointer',
                  }}
                >
                  <option value="">e.g. Kenya</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
                {errors.country && (
                  <p style={{ color: '#EF4444', fontSize: '0.875rem', marginTop: '0.25rem', margin: 0 }}>
                    {errors.country}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="industry"
                  style={{
                    display: 'block',
                    fontSize: '0.9375rem',
                    fontWeight: 600,
                    color: '#1F2937',
                    marginBottom: '0.5rem',
                  }}
                >
                  Primary Industry/Category <span style={{ color: '#FD5A47' }}>*</span>
                </label>
                <select
                  id="industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    fontSize: '1rem',
                    border: errors.industry ? '2px solid #EF4444' : '1px solid #D1D5DB',
                    borderRadius: '8px',
                    outline: 'none',
                    background: '#FFFFFF',
                    cursor: 'pointer',
                  }}
                >
                  <option value="">e.g. Education</option>
                  {industries.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
                {errors.industry && (
                  <p style={{ color: '#EF4444', fontSize: '0.875rem', marginTop: '0.25rem', margin: 0 }}>
                    {errors.industry}
                  </p>
                )}
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  color: '#1F2937',
                  marginBottom: '0.75rem',
                }}
              >
                How do you accept Bitcoin? <span style={{ color: '#FD5A47' }}>*</span>
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    name="bitcoinOnchain"
                    checked={formData.bitcoinOnchain}
                    onChange={handleChange}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.9375rem', color: '#1F2937' }}>Bitcoin Onchain</span>
                </label>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    name="lightning"
                    checked={formData.lightning}
                    onChange={handleChange}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.9375rem', color: '#1F2937' }}>Lightning</span>
                </label>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    name="giftCards"
                    checked={formData.giftCards}
                    onChange={handleChange}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.9375rem', color: '#1F2937' }}>Gift Cards</span>
                </label>
              </div>
              {errors.bitcoinAcceptance && (
                <p style={{ color: '#EF4444', fontSize: '0.875rem', marginTop: '0.25rem', margin: 0 }}>
                  {errors.bitcoinAcceptance}
                </p>
              )}
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label
                htmlFor="description"
                style={{
                  display: 'block',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  color: '#1F2937',
                  marginBottom: '0.5rem',
                }}
              >
                Project Description <span style={{ color: '#FD5A47' }}>*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Tell us about your project"
                rows={6}
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  fontSize: '1rem',
                  border: errors.description ? '2px solid #EF4444' : '1px solid #D1D5DB',
                  borderRadius: '8px',
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#FD5A47';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = errors.description ? '#EF4444' : '#D1D5DB';
                }}
              />
              {errors.description && (
                <p style={{ color: '#EF4444', fontSize: '0.875rem', marginTop: '0.25rem', margin: 0 }}>
                  {errors.description}
                </p>
              )}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1.5rem',
                marginBottom: '1.5rem',
              }}
            >
              <div>
                <label
                  htmlFor="website"
                  style={{
                    display: 'block',
                    fontSize: '0.9375rem',
                    fontWeight: 600,
                    color: '#1F2937',
                    marginBottom: '0.5rem',
                  }}
                >
                  Website url <span style={{ color: '#FD5A47' }}>*</span>
                </label>
                <input
                  type="text"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="e.g. bitcoiners.africa"
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    fontSize: '1rem',
                    border: errors.website ? '2px solid #EF4444' : '1px solid #D1D5DB',
                    borderRadius: '8px',
                    outline: 'none',
                  }}
                />
                {errors.website && (
                  <p style={{ color: '#EF4444', fontSize: '0.875rem', marginTop: '0.25rem', margin: 0 }}>
                    {errors.website}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  style={{
                    display: 'block',
                    fontSize: '0.9375rem',
                    fontWeight: 600,
                    color: '#1F2937',
                    marginBottom: '0.5rem',
                  }}
                >
                  Email Address <span style={{ color: '#FD5A47' }}>*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. john@gmail.com"
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    fontSize: '1rem',
                    border: errors.email ? '2px solid #EF4444' : '1px solid #D1D5DB',
                    borderRadius: '8px',
                    outline: 'none',
                  }}
                />
                {errors.email && (
                  <p style={{ color: '#EF4444', fontSize: '0.875rem', marginTop: '0.25rem', margin: 0 }}>
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  color: '#1F2937',
                  marginBottom: '1rem',
                }}
              >
                Social Media Handles
              </label>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '1rem',
                }}
              >
                <div>
                  <label
                    htmlFor="twitter"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.875rem',
                      color: '#4B5563',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    X Handle
                  </label>
                  <input
                    type="text"
                    id="twitter"
                    name="twitter"
                    value={formData.twitter}
                    onChange={handleChange}
                    placeholder="e.g. @afribitcoiners"
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem',
                      fontSize: '1rem',
                      border: '1px solid #D1D5DB',
                      borderRadius: '8px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label
                    htmlFor="linkedin"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.875rem',
                      color: '#4B5563',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                    Linked In Username
                  </label>
                  <input
                    type="text"
                    id="linkedin"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleChange}
                    placeholder="e.g. African Bitcoiners"
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem',
                      fontSize: '1rem',
                      border: '1px solid #D1D5DB',
                      borderRadius: '8px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label
                    htmlFor="facebook"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.875rem',
                      color: '#4B5563',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Facebook Username
                  </label>
                  <input
                    type="text"
                    id="facebook"
                    name="facebook"
                    value={formData.facebook}
                    onChange={handleChange}
                    placeholder="e.g. African Bitcoiners"
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem',
                      fontSize: '1rem',
                      border: '1px solid #D1D5DB',
                      borderRadius: '8px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label
                    htmlFor="nostr"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.875rem',
                      color: '#4B5563',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                    Nostr Address
                  </label>
                  <input
                    type="text"
                    id="nostr"
                    name="nostr"
                    value={formData.nostr}
                    onChange={handleChange}
                    placeholder="e.g. @afribitcoiners"
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem',
                      fontSize: '1rem',
                      border: '1px solid #D1D5DB',
                      borderRadius: '8px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label
                    htmlFor="instagram"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.875rem',
                      color: '#4B5563',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                    Instagram Username
                  </label>
                  <input
                    type="text"
                    id="instagram"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleChange}
                    placeholder="e.g. @afribitcoiners"
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem',
                      fontSize: '1rem',
                      border: '1px solid #D1D5DB',
                      borderRadius: '8px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '1rem 2rem',
                background: '#FD5A47',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#E04835';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#FD5A47';
              }}
            >
              Submit Project
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

