import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { authenticatedFetch } from '../utils/api';
import twitterIcon from '../assets/twitter-icon.png';
import linkedInIcon from '../assets/linkedIn-icon.png';
import nostrIcon from '../assets/nostr-icon.png';
import instagramIcon from '../assets/instagram-icon.png';
import bitcoinIcon from '../assets/bitcoin-icon.png';
import lightningIcon from '../assets/lightning-icon.png';

interface FormData {
  projectName: string;
  country: string;
  industry: string;
  bitcoinOnchain: boolean;
  lightning: boolean;
  giftCards: boolean;
  description: string;
  websiteUrl: string;
  email: string;
  twitterHandle: string;
  linkedinUsername: string;
  facebookUsername: string;
  nostrAddress: string;
  instagramUsername: string;
  projectLogo: File | null;
}

const countries = [
  'Algeria',
  'Angola',
  'Benin',
  'Botswana',
  'Burkina Faso',
  'Burundi',
  'Cameroon',
  'Cape Verde',
  'Central African Republic',
  'Chad',
  'Comoros',
  'Congo',
  "Côte d'Ivoire",
  'Djibouti',
  'Egypt',
  'Equatorial Guinea',
  'Eritrea',
  'Eswatini',
  'Ethiopia',
  'Gabon',
  'Gambia',
  'Ghana',
  'Guinea',
  'Guinea-Bissau',
  'Kenya',
  'Lesotho',
  'Liberia',
  'Libya',
  'Madagascar',
  'Malawi',
  'Mali',
  'Mauritania',
  'Mauritius',
  'Morocco',
  'Mozambique',
  'Namibia',
  'Niger',
  'Nigeria',
  'Rwanda',
  'São Tomé and Príncipe',
  'Senegal',
  'Seychelles',
  'Sierra Leone',
  'Somalia',
  'South Africa',
  'South Sudan',
  'Sudan',
  'Tanzania',
  'Togo',
  'Tunisia',
  'Uganda',
  'Zambia',
  'Zimbabwe',
  'Africa Wide',
  'Global',
];

const industries = [
  'Business',
  'Education',
  'Circular Economy',
  'Mining',
  'Community',
  'Retail',
  'Payments',
  'Wallet',
  'Exchange',
  'Media',
  'Tourism',
  'Charity',
  'Non Profit',
  'Conference',
  'Tech Meetup',
  'Developer Community',
  'Funding',
  'Hodl',
  'Other',
];

export default function ListProjectPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    projectName: '',
    country: '',
    industry: '',
    bitcoinOnchain: false,
    lightning: false,
    giftCards: false,
    description: '',
    websiteUrl: '',
    email: '',
    twitterHandle: '',
    linkedinUsername: '',
    facebookUsername: '',
    nostrAddress: '',
    instagramUsername: '',
    projectLogo: null,
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setFormData((prev) => ({ ...prev, projectLogo: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.projectName.trim()) {
      newErrors.projectName = 'Project name is required';
    }
    if (!formData.country) {
      newErrors.country = 'Country is required';
    }
    if (!formData.industry) {
      newErrors.industry = 'Industry is required';
    }
    if (!formData.bitcoinOnchain && !formData.lightning && !formData.giftCards) {
      newErrors.bitcoinOnchain = 'Please select at least one Bitcoin acceptance method';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Project description is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await authenticatedFetch('/api/projects/submit', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        navigate('/project-submitted');
      } else {
        try {
          const data = await response.json();
          alert(data.error || `Failed to submit project (${response.status}). Please try again.`);
        } catch (parseError) {
          if (response.status === 404) {
            alert('API endpoint not found. The backend server may not be running or the endpoint is not yet implemented.');
          } else {
            alert(`Failed to submit project (${response.status} ${response.statusText}). Please try again.`);
          }
        }
      }
    } catch (error) {
      console.error('Error submitting project:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        alert('Unable to connect to the server. Please check that the backend API is running.');
      } else {
        alert('An error occurred while submitting your project. Please try again later.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="app-main" style={{ background: '#F5F5F5', minHeight: '100vh', padding: '4rem 1rem' }}>
      <div className="container" style={{ maxWidth: 900, margin: '0 auto' }}>
        <section
          style={{
            marginBottom: '4rem',
            background: '#F5F5F5',
            padding: '3rem 2rem',
            borderRadius: '12px',
          }}
        >
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              color: '#1F2937',
              textAlign: 'center',
              marginBottom: '3rem',
            }}
          >
            Steps to get listed
          </h1>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '2rem',
              maxWidth: 1000,
              margin: '0 auto',
            }}
          >
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: '#FD5A47',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  marginBottom: '-25px',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                1
              </div>
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: '12px',
                  padding: '2.5rem 1.5rem 1.5rem',
                  marginTop: '25px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                  width: '100%',
                }}
              >
                <h3
                  style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: '#1F2937',
                    marginBottom: '0.75rem',
                    textAlign: 'left',
                  }}
                >
                  Submit Your Details
                </h3>
                <p
                  style={{
                    fontSize: '0.875rem',
                    color: '#4B5563',
                    lineHeight: 1.6,
                    margin: 0,
                    textAlign: 'left',
                  }}
                >
                  Fill out the form below with comprehensive information about your project, including
                  proof of Bitcoin acceptance and your circular economy goals.
                </p>
              </div>
            </div>

            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: '#FD5A47',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  marginBottom: '-25px',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                2
              </div>
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: '12px',
                  padding: '2.5rem 1.5rem 1.5rem',
                  marginTop: '25px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                  width: '100%',
                }}
              >
                <h3
                  style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: '#1F2937',
                    marginBottom: '0.75rem',
                    textAlign: 'left',
                  }}
                >
                  Internal Review & Authorization
                </h3>
                <p
                  style={{
                    fontSize: '0.875rem',
                    color: '#4B5563',
                    lineHeight: 1.6,
                    margin: 0,
                    textAlign: 'left',
                  }}
                >
                  Fill out the form below with comprehensive information about your project, including
                  proof of Bitcoin acceptance and your circular economy goals.
                </p>
              </div>
            </div>

            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: '#FD5A47',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  marginBottom: '-25px',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                3
              </div>
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: '12px',
                  padding: '2.5rem 1.5rem 1.5rem',
                  marginTop: '25px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                  width: '100%',
                }}
              >
                <h3
                  style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: '#1F2937',
                    marginBottom: '0.75rem',
                    textAlign: 'left',
                  }}
                >
                  Go Live
                </h3>
                <p
                  style={{
                    fontSize: '0.875rem',
                    color: '#4B5563',
                    lineHeight: 1.6,
                    margin: 0,
                    textAlign: 'left',
                  }}
                >
                  Once authorized, your listing instantly becomes visible on the directory map and
                  search results.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          style={{
            background: '#FFFFFF',
            borderRadius: '12px',
            padding: '3rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          }}
        >
          <h2
            style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              color: '#1F2937',
              marginBottom: '2.5rem',
            }}
          >
            Project Listing Form
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label
                htmlFor="projectLogo"
                style={{
                  display: 'block',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  color: '#1F2937',
                  marginBottom: '0.5rem',
                }}
              >
                Project Logo
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <input
                  type="file"
                  id="projectLogo"
                  name="projectLogo"
                  accept="image/*"
                  onChange={handleLogoChange}
                  style={{
                    fontSize: '0.9375rem',
                    cursor: 'pointer',
                  }}
                />
                {logoPreview && (
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    style={{
                      width: '80px',
                      height: '80px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '1px solid #D1D5DB',
                    }}
                  />
                )}
              </div>
            </div>

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
                Project / Business Name
              </label>
              <input
                type="text"
                id="projectName"
                name="projectName"
                value={formData.projectName}
                onChange={handleChange}
                placeholder="e.g African Bitcoiners"
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  fontSize: '0.9375rem',
                  border: errors.projectName ? '2px solid #EF4444' : '1px solid #D1D5DB',
                  borderRadius: '8px',
                  outline: 'none',
                  background: '#F9FAFB',
                  color: '#1F2937',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#FD5A47';
                  e.currentTarget.style.background = '#FFFFFF';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = errors.projectName ? '#EF4444' : '#D1D5DB';
                  e.currentTarget.style.background = '#F9FAFB';
                }}
              />
              {errors.projectName && (
                <p style={{ color: '#EF4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>
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
                  Country of Operation
                </label>
                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    fontSize: '0.9375rem',
                    border: errors.country ? '2px solid #EF4444' : '1px solid #D1D5DB',
                    borderRadius: '8px',
                    outline: 'none',
                    background: '#F9FAFB',
                    color: '#1F2937',
                    cursor: 'pointer',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%231F2937' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                    paddingRight: '2.5rem',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#FD5A47';
                    e.currentTarget.style.background = '#FFFFFF';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = errors.country ? '#EF4444' : '#D1D5DB';
                    e.currentTarget.style.background = '#F9FAFB';
                  }}
                >
                  <option value="">e.g Kenya</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
                {errors.country && (
                  <p style={{ color: '#EF4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>
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
                  Primary Industry/Category
                </label>
                <select
                  id="industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    fontSize: '0.9375rem',
                    border: errors.industry ? '2px solid #EF4444' : '1px solid #D1D5DB',
                    borderRadius: '8px',
                    outline: 'none',
                    background: '#F9FAFB',
                    color: '#1F2937',
                    cursor: 'pointer',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%231F2937' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                    paddingRight: '2.5rem',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#FD5A47';
                    e.currentTarget.style.background = '#FFFFFF';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = errors.industry ? '#EF4444' : '#D1D5DB';
                    e.currentTarget.style.background = '#F9FAFB';
                  }}
                >
                  <option value="">e.g Education</option>
                  {industries.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
                {errors.industry && (
                  <p style={{ color: '#EF4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>
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
                How do you accept Bitcoin?
              </label>
              <div style={{ display: 'flex', flexDirection: 'row', gap: '1.5rem', flexWrap: 'wrap' }}>
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
                    style={{
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer',
                      accentColor: '#FD5A47',
                    }}
                  />
                  <img
                    src={bitcoinIcon}
                    alt="Bitcoin"
                    style={{ width: '20px', height: '20px', objectFit: 'contain' }}
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
                    style={{
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer',
                      accentColor: '#FD5A47',
                    }}
                  />
                  <img
                    src={lightningIcon}
                    alt="Lightning"
                    style={{ width: '20px', height: '20px', objectFit: 'contain' }}
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
                    style={{
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer',
                      accentColor: '#FD5A47',
                    }}
                  />
                  <span style={{ fontSize: '0.9375rem', color: '#1F2937' }}>Gift Cards</span>
                </label>
              </div>
              {errors.bitcoinOnchain && (
                <p style={{ color: '#EF4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                  {errors.bitcoinOnchain}
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
                Project Description
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
                  fontSize: '0.9375rem',
                  border: errors.description ? '2px solid #EF4444' : '1px solid #D1D5DB',
                  borderRadius: '8px',
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  background: '#F9FAFB',
                  color: '#1F2937',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#FD5A47';
                  e.currentTarget.style.background = '#FFFFFF';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = errors.description ? '#EF4444' : '#D1D5DB';
                  e.currentTarget.style.background = '#F9FAFB';
                }}
              />
              {errors.description && (
                <p style={{ color: '#EF4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                  {errors.description}
                </p>
              )}
            </div>

            <div style={{ marginBottom: '2rem' }}>
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
                    htmlFor="websiteUrl"
                    style={{
                      display: 'block',
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      color: '#1F2937',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Website url
                  </label>
                  <input
                    type="url"
                    id="websiteUrl"
                    name="websiteUrl"
                    value={formData.websiteUrl}
                    onChange={handleChange}
                    placeholder="e.g bitcoiners.africa"
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem',
                      fontSize: '0.9375rem',
                      border: '1px solid #D1D5DB',
                      borderRadius: '8px',
                      outline: 'none',
                      background: '#F9FAFB',
                      color: '#1F2937',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#FD5A47';
                      e.currentTarget.style.background = '#FFFFFF';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#D1D5DB';
                      e.currentTarget.style.background = '#F9FAFB';
                    }}
                  />
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
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g john@gmail.com"
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem',
                      fontSize: '0.9375rem',
                      border: errors.email ? '2px solid #EF4444' : '1px solid #D1D5DB',
                      borderRadius: '8px',
                      outline: 'none',
                      background: '#F9FAFB',
                      color: '#1F2937',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#FD5A47';
                      e.currentTarget.style.background = '#FFFFFF';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = errors.email ? '#EF4444' : '#D1D5DB';
                      e.currentTarget.style.background = '#F9FAFB';
                    }}
                  />
                  {errors.email && (
                    <p style={{ color: '#EF4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '1.5rem',
                  marginBottom: '1.5rem',
                }}
              >
                <div>
                  <label
                    htmlFor="twitterHandle"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      color: '#1F2937',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <img
                      src={twitterIcon}
                      alt="Twitter"
                      style={{ width: '24px', height: '24px', objectFit: 'contain', flexShrink: 0 }}
                    />
                    X Handle
                  </label>
                  <input
                    type="text"
                    id="twitterHandle"
                    name="twitterHandle"
                    value={formData.twitterHandle}
                    onChange={handleChange}
                    placeholder="e.g @afribitcoiners"
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem',
                      fontSize: '0.9375rem',
                      border: '1px solid #D1D5DB',
                      borderRadius: '8px',
                      outline: 'none',
                      background: '#F9FAFB',
                      color: '#1F2937',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#FD5A47';
                      e.currentTarget.style.background = '#FFFFFF';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#D1D5DB';
                      e.currentTarget.style.background = '#F9FAFB';
                    }}
                  />
                </div>

                <div>
                  <label
                    htmlFor="linkedinUsername"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      color: '#1F2937',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <img
                      src={linkedInIcon}
                      alt="LinkedIn"
                      style={{ width: '24px', height: '24px', objectFit: 'contain', flexShrink: 0 }}
                    />
                    Linked in Username
                  </label>
                  <input
                    type="text"
                    id="linkedinUsername"
                    name="linkedinUsername"
                    value={formData.linkedinUsername}
                    onChange={handleChange}
                    placeholder="e.g African Bitcoiners"
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem',
                      fontSize: '0.9375rem',
                      border: '1px solid #D1D5DB',
                      borderRadius: '8px',
                      outline: 'none',
                      background: '#F9FAFB',
                      color: '#1F2937',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#FD5A47';
                      e.currentTarget.style.background = '#FFFFFF';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#D1D5DB';
                      e.currentTarget.style.background = '#F9FAFB';
                    }}
                  />
                </div>

                <div>
                  <label
                    htmlFor="facebookUsername"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      color: '#1F2937',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '4px',
                        background: '#1877F2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <span style={{ color: '#FFFFFF', fontSize: '0.875rem', fontWeight: 700 }}>
                        f
                      </span>
                    </div>
                    Facebook Username
                  </label>
                  <input
                    type="text"
                    id="facebookUsername"
                    name="facebookUsername"
                    value={formData.facebookUsername}
                    onChange={handleChange}
                    placeholder="e.g African Bitcoiners"
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem',
                      fontSize: '0.9375rem',
                      border: '1px solid #D1D5DB',
                      borderRadius: '8px',
                      outline: 'none',
                      background: '#F9FAFB',
                      color: '#1F2937',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#FD5A47';
                      e.currentTarget.style.background = '#FFFFFF';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#D1D5DB';
                      e.currentTarget.style.background = '#F9FAFB';
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '1.5rem',
                }}
              >
                <div>
                  <label
                    htmlFor="nostrAddress"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      color: '#1F2937',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <img
                      src={nostrIcon}
                      alt="Nostr"
                      style={{ width: '24px', height: '24px', objectFit: 'contain', flexShrink: 0 }}
                    />
                    Nostr Address
                  </label>
                  <input
                    type="text"
                    id="nostrAddress"
                    name="nostrAddress"
                    value={formData.nostrAddress}
                    onChange={handleChange}
                    placeholder="e.g @afribitcoiners"
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem',
                      fontSize: '0.9375rem',
                      border: '1px solid #D1D5DB',
                      borderRadius: '8px',
                      outline: 'none',
                      background: '#F9FAFB',
                      color: '#1F2937',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#FD5A47';
                      e.currentTarget.style.background = '#FFFFFF';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#D1D5DB';
                      e.currentTarget.style.background = '#F9FAFB';
                    }}
                  />
                </div>

                <div>
                  <label
                    htmlFor="instagramUsername"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      color: '#1F2937',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <img
                      src={instagramIcon}
                      alt="Instagram"
                      style={{ width: '24px', height: '24px', objectFit: 'contain', flexShrink: 0 }}
                    />
                    Instagram Username
                  </label>
                  <input
                    type="text"
                    id="instagramUsername"
                    name="instagramUsername"
                    value={formData.instagramUsername}
                    onChange={handleChange}
                    placeholder="e.g @afribitcoiners"
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem',
                      fontSize: '0.9375rem',
                      border: '1px solid #D1D5DB',
                      borderRadius: '8px',
                      outline: 'none',
                      background: '#F9FAFB',
                      color: '#1F2937',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#FD5A47';
                      e.currentTarget.style.background = '#FFFFFF';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#D1D5DB';
                      e.currentTarget.style.background = '#F9FAFB';
                    }}
                  />
                </div>

                <div></div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '0.875rem 2rem',
                background: isSubmitting ? '#D1D5DB' : '#FD5A47',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: isSubmitting ? 'none' : '0 2px 4px rgba(253, 90, 71, 0.2)',
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.background = '#E04835';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(253, 90, 71, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.background = '#FD5A47';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(253, 90, 71, 0.2)';
                }
              }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Project'}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

