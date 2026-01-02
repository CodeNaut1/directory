import { useState, FormEvent, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import twitterIcon from '../assets/twitter-icon.png';
import linkedInIcon from '../assets/linkedIn-icon.png';
import nostrIcon from '../assets/nostr-icon.png';
import instagramIcon from '../assets/instagram-icon.png';
import bitcoinIcon from '../assets/bitcoin-icon.png';
import lightningIcon from '../assets/lightning-icon.png';

interface Country {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

interface Tag {
  id: string;
  name: string;
}

interface FormData {
  projectName: string;
  countryId: string;
  categoryId: string;
  selectedTags: string[];
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
}

export default function EditProject() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const API_URL = import.meta.env.VITE_API_URL || '';

  const [countries, setCountries] = useState<Country[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingProject, setLoadingProject] = useState(true);
  const [showWarning, setShowWarning] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    projectName: '',
    countryId: '',
    categoryId: '',
    selectedTags: [],
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
  });

  const [originalData, setOriginalData] = useState<FormData | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasChanges = () => {
    if (!originalData) return false;
    return JSON.stringify(formData) !== JSON.stringify(originalData);
  };

  useEffect(() => {
    document.title = "Edit Project - African Bitcoin Directory";
  }, []);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) {
        navigate('/dashboard');
        return;
      }

      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_URL}/api/projects/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            const project = data.data;

            const loadedData = {
              projectName: project.name || '',
              countryId: project.country?.id || '',
              categoryId: project.category?.id || '',
              selectedTags: project.tags?.map((tag: any) => tag.id) || [],
              bitcoinOnchain: project.details?.bitcoinOnly || false,
              lightning: project.details?.lightningNetwork || false,
              giftCards: false,
              description: project.description || '',
              websiteUrl: project.website || '',
              email: project.details?.contactEmail || '',
              twitterHandle: project.details?.socialLinks?.twitter?.replace('https://twitter.com/', '').replace('@', '') || '',
              linkedinUsername: project.details?.socialLinks?.linkedin?.replace('https://linkedin.com/in/', '') || '',
              facebookUsername: project.details?.socialLinks?.facebook?.replace('https://facebook.com/', '') || '',
              nostrAddress: project.details?.socialLinks?.nostr?.replace('https://njump.me/', '') || '',
              instagramUsername: project.details?.socialLinks?.instagram?.replace('https://instagram.com/', '').replace('@', '') || '',
            };

            setFormData(loadedData);
            setOriginalData(loadedData);
          }
        } else {
          alert('Failed to load project');
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error fetching project:', error);
        alert('Failed to load project');
        navigate('/dashboard');
      } finally {
        setLoadingProject(false);
      }
    };

    fetchProject();
  }, [id, navigate, API_URL]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [countriesRes, categoriesRes, tagsRes] = await Promise.all([
          fetch(`${API_URL}/api/countries`),
          fetch(`${API_URL}/api/categories`),
          fetch(`${API_URL}/api/tags`),
        ]);

        if (countriesRes.ok && categoriesRes.ok && tagsRes.ok) {
          const countriesData = await countriesRes.json();
          const categoriesData = await categoriesRes.json();
          const tagsData = await tagsRes.json();

          if (countriesData.success) setCountries(countriesData.data);
          if (categoriesData.success) setCategories(categoriesData.data);
          if (tagsData.success) setTags(tagsData.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [API_URL]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

  const handleTagToggle = (tagId: string) => {
    setFormData((prev) => {
      const isSelected = prev.selectedTags.includes(tagId);
      if (isSelected) {
        return { ...prev, selectedTags: prev.selectedTags.filter(id => id !== tagId) };
      } else {
        if (prev.selectedTags.length >= 6) return prev;
        return { ...prev, selectedTags: [...prev.selectedTags, tagId] };
      }
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!formData.projectName.trim()) newErrors.projectName = 'Project name is required';
    if (!formData.countryId) newErrors.countryId = 'Country is required';
    if (!formData.categoryId) newErrors.categoryId = 'Category is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        alert('You must be logged in');
        navigate('/login');
        return;
      }

      let normalizedUrl = formData.websiteUrl.trim();
      if (normalizedUrl && !normalizedUrl.startsWith('http')) {
        normalizedUrl = `https://${normalizedUrl}`;
      }

      const socialLinks: Record<string, string> = {};
      if (formData.twitterHandle) {
        socialLinks.twitter = `https://twitter.com/${formData.twitterHandle.replace('@', '')}`;
      }
      if (formData.linkedinUsername) {
        socialLinks.linkedin = formData.linkedinUsername.startsWith('http')
          ? formData.linkedinUsername
          : `https://linkedin.com/in/${formData.linkedinUsername}`;
      }
      if (formData.facebookUsername) {
        socialLinks.facebook = formData.facebookUsername.startsWith('http')
          ? formData.facebookUsername
          : `https://facebook.com/${formData.facebookUsername}`;
      }
      if (formData.nostrAddress) {
        socialLinks.nostr = formData.nostrAddress.startsWith('http')
          ? formData.nostrAddress
          : `https://njump.me/${formData.nostrAddress}`;
      }
      if (formData.instagramUsername) {
        socialLinks.instagram = `https://instagram.com/${formData.instagramUsername.replace('@', '')}`;
      }

      const payload = {
        name: formData.projectName,
        description: formData.description,
        website: normalizedUrl || undefined,
        countryId: formData.countryId,
        categoryId: formData.categoryId,
        tagIds: formData.selectedTags.length > 0 ? formData.selectedTags : undefined,
        details: {
          contactEmail: formData.email,
          socialLinks: Object.keys(socialLinks).length > 0 ? socialLinks : undefined,
          bitcoinOnly: formData.bitcoinOnchain,
          lightningNetwork: formData.lightning,
        },
      };

      const response = await fetch(`${API_URL}/api/projects/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setShowSuccessModal(true);
      } else {
        const data = await response.json();
        alert(data.error?.message || 'Failed to update project');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingProject || loadingData) {
    return (
      <main className="app-main" style={{ background: '#F5F5F5', minHeight: '100vh', padding: 'clamp(2rem, 5vw, 4rem) clamp(1rem, 4vw, 1rem)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <p>Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .warning-banner {
            padding: 0.75rem 1rem !important;
          }
          .warning-content {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 0.5rem !important;
          }
          .warning-close {
            align-self: flex-end !important;
            margin-top: -0.5rem !important;
          }
          .form-grid-2 {
            grid-template-columns: 1fr !important;
          }
          .form-grid-3 {
            grid-template-columns: 1fr !important;
          }
          .button-group {
            flex-direction: column !important;
          }
          .button-group button {
            width: 100% !important;
          }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .form-grid-3 {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>

      {showWarning && (
        <div className="warning-banner" style={{ position: 'fixed', top: 0, left: 0, right: 0, background: '#FFF4E6', borderBottom: '1px solid #FDB022', padding: '1rem', zIndex: 1000 }}>
          <div className="warning-content" style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="#B54708">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p style={{ margin: 0, color: '#92400E', fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', fontWeight: 500 }}>
                Any changes you make will require re-approval before your project goes live again.
              </p>
            </div>
            <button className="warning-close" onClick={() => setShowWarning(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#92400E', fontSize: '1.25rem', padding: '0.25rem' }}>×</button>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '1rem' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: 'clamp(2rem, 5vw, 3rem)', maxWidth: '500px', width: '100%', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ width: 'clamp(60px, 15vw, 80px)', height: 'clamp(60px, 15vw, 80px)', borderRadius: '50%', background: '#10B981', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 4px 6px rgba(16, 185, 129, 0.3)' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 700, color: '#1F2937', margin: '0 0 1rem 0' }}>
              {hasChanges() ? 'Changes Submitted for Review' : 'No Changes Made'}
            </h1>
            <p style={{ fontSize: 'clamp(0.875rem, 2vw, 1rem)', color: '#4B5563', lineHeight: 1.6, margin: '0 0 2rem 0' }}>
              {hasChanges()
                ? 'Your updates have been received. Our team will review the changes to ensure everything meets our guidelines. You\'ll receive an update within 2 days.'
                : 'No changes were detected. Your project remains published.'}
            </p>
            <button onClick={() => navigate('/dashboard')} style={{ padding: '0.75rem 2rem', background: '#FD5A47', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '0.9375rem', fontWeight: 600, cursor: 'pointer', width: '100%' }}>
              Go to Dashboard
            </button>
          </div>
        </div>
      )}

      <main className="app-main" style={{ background: '#F5F5F5', minHeight: '100vh', padding: showWarning ? 'calc(clamp(4rem, 8vw, 6rem) + 4rem) clamp(1rem, 4vw, 1rem) clamp(2rem, 5vw, 4rem)' : 'clamp(2rem, 5vw, 4rem) clamp(1rem, 4vw, 1rem)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ marginBottom: '2rem' }}>
            <Link to="/dashboard" style={{ color: '#FD5A47', textDecoration: 'none', fontSize: '0.875rem' }}>
              ← Back to Dashboard
            </Link>
            <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 700, color: '#1F2937', marginTop: '1rem' }}>
              Edit Project
            </h1>
          </div>

          <section style={{ background: '#FFFFFF', borderRadius: '12px', padding: 'clamp(1.5rem, 4vw, 3rem)', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="projectName" style={{ display: 'block', fontSize: '0.9375rem', fontWeight: 600, color: '#1F2937', marginBottom: '0.5rem' }}>Project Name</label>
                <input type="text" id="projectName" name="projectName" value={formData.projectName} onChange={handleChange} style={{ width: '100%', padding: '0.875rem 1rem', fontSize: '0.9375rem', border: errors.projectName ? '2px solid #EF4444' : '1px solid #D1D5DB', borderRadius: '8px', outline: 'none', background: '#F9FAFB' }} />
                {errors.projectName && <p style={{ color: '#EF4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.projectName}</p>}
              </div>

              <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <label htmlFor="countryId" style={{ display: 'block', fontSize: '0.9375rem', fontWeight: 600, color: '#1F2937', marginBottom: '0.5rem' }}>Country</label>
                  <select id="countryId" name="countryId" value={formData.countryId} onChange={handleChange} style={{ width: '100%', padding: '0.875rem 1rem', fontSize: '0.9375rem', border: '1px solid #D1D5DB', borderRadius: '8px', background: '#F9FAFB', cursor: 'pointer' }}>
                    <option value="">Select country</option>
                    {countries.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="categoryId" style={{ display: 'block', fontSize: '0.9375rem', fontWeight: 600, color: '#1F2937', marginBottom: '0.5rem' }}>Category</label>
                  <select id="categoryId" name="categoryId" value={formData.categoryId} onChange={handleChange} style={{ width: '100%', padding: '0.875rem 1rem', fontSize: '0.9375rem', border: '1px solid #D1D5DB', borderRadius: '8px', background: '#F9FAFB', cursor: 'pointer' }}>
                    <option value="">Select category</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.9375rem', fontWeight: 600, color: '#1F2937', marginBottom: '0.75rem' }}>
                  Tags ({formData.selectedTags.length}/6)
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                  {tags.map((tag) => {
                    const isSelected = formData.selectedTags.includes(tag.id);
                    const isDisabled = !isSelected && formData.selectedTags.length >= 6;
                    return (
                      <button key={tag.id} type="button" onClick={() => handleTagToggle(tag.id)} disabled={isDisabled} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', border: isSelected ? '2px solid #FD5A47' : '1px solid #D1D5DB', borderRadius: '9999px', background: isSelected ? '#FEF3F2' : '#FFF', color: isSelected ? '#FD5A47' : '#1F2937', cursor: isDisabled ? 'not-allowed' : 'pointer', opacity: isDisabled ? 0.5 : 1 }}>
                        {tag.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.9375rem', fontWeight: 600, color: '#1F2937', marginBottom: '0.75rem' }}>Bitcoin Acceptance</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="checkbox" name="bitcoinOnchain" checked={formData.bitcoinOnchain} onChange={handleChange} style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#FD5A47' }} />
                    <img src={bitcoinIcon} alt="Bitcoin" style={{ width: '20px', height: '20px' }} />
                    <span>Bitcoin Onchain</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="checkbox" name="lightning" checked={formData.lightning} onChange={handleChange} style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#FD5A47' }} />
                    <img src={lightningIcon} alt="Lightning" style={{ width: '20px', height: '20px' }} />
                    <span>Lightning</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="checkbox" name="giftCards" checked={formData.giftCards} onChange={handleChange} style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#FD5A47' }} />
                    <span>Gift Cards</span>
                  </label>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="description" style={{ display: 'block', fontSize: '0.9375rem', fontWeight: 600, color: '#1F2937', marginBottom: '0.5rem' }}>Description</label>
                <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={6} style={{ width: '100%', padding: '0.875rem 1rem', fontSize: '0.9375rem', border: '1px solid #D1D5DB', borderRadius: '8px', fontFamily: 'inherit', background: '#F9FAFB', resize: 'vertical' }} />
              </div>

              <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <label htmlFor="websiteUrl" style={{ display: 'block', fontSize: '0.9375rem', fontWeight: 600, color: '#1F2937', marginBottom: '0.5rem' }}>Website</label>
                  <input type="text" id="websiteUrl" name="websiteUrl" value={formData.websiteUrl} onChange={handleChange} style={{ width: '100%', padding: '0.875rem 1rem', border: '1px solid #D1D5DB', borderRadius: '8px', background: '#F9FAFB' }} />
                </div>
                <div>
                  <label htmlFor="email" style={{ display: 'block', fontSize: '0.9375rem', fontWeight: 600, color: '#1F2937', marginBottom: '0.5rem' }}>Email</label>
                  <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} style={{ width: '100%', padding: '0.875rem 1rem', border: '1px solid #D1D5DB', borderRadius: '8px', background: '#F9FAFB' }} />
                </div>
              </div>

              <div className="form-grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9375rem', fontWeight: 600, color: '#1F2937' }}>
                    <img src={twitterIcon} alt="X" style={{ width: '20px', height: '20px' }} />
                    X Handle
                  </label>
                  <input type="text" name="twitterHandle" value={formData.twitterHandle} onChange={handleChange} placeholder="@username" style={{ width: '100%', padding: '0.875rem 1rem', border: '1px solid #D1D5DB', borderRadius: '8px', background: '#F9FAFB' }} />
                </div>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9375rem', fontWeight: 600, color: '#1F2937' }}>
                    <img src={linkedInIcon} alt="LinkedIn" style={{ width: '20px', height: '20px' }} />
                    LinkedIn
                  </label>
                  <input type="text" name="linkedinUsername" value={formData.linkedinUsername} onChange={handleChange} style={{ width: '100%', padding: '0.875rem 1rem', border: '1px solid #D1D5DB', borderRadius: '8px', background: '#F9FAFB' }} />
                </div>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9375rem', fontWeight: 600, color: '#1F2937' }}>
                    <span style={{ width: '20px', height: '20px', borderRadius: '4px', background: '#1877F2', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>f</span>
                    Facebook
                  </label>
                  <input type="text" name="facebookUsername" value={formData.facebookUsername} onChange={handleChange} placeholder="African Bitcoiners" style={{ width: '100%', padding: '0.875rem 1rem', border: '1px solid #D1D5DB', borderRadius: '8px', background: '#F9FAFB' }} />
                </div>
              </div>

              <div className="form-grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9375rem', fontWeight: 600, color: '#1F2937' }}>
                    <img src={nostrIcon} alt="Nostr" style={{ width: '20px', height: '20px' }} />
                    Nostr
                  </label>
                  <input type="text" name="nostrAddress" value={formData.nostrAddress} onChange={handleChange} placeholder="@afribitcoiners" style={{ width: '100%', padding: '0.875rem 1rem', border: '1px solid #D1D5DB', borderRadius: '8px', background: '#F9FAFB' }} />
                </div>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9375rem', fontWeight: 600, color: '#1F2937' }}>
                    <img src={instagramIcon} alt="Instagram" style={{ width: '20px', height: '20px' }} />
                    Instagram
                  </label>
                  <input type="text" name="instagramUsername" value={formData.instagramUsername} onChange={handleChange} placeholder="@afribitcoiners" style={{ width: '100%', padding: '0.875rem 1rem', border: '1px solid #D1D5DB', borderRadius: '8px', background: '#F9FAFB' }} />
                </div>
                <div></div>
              </div>

              <div className="button-group" style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" onClick={() => navigate('/dashboard')} style={{ flex: 1, padding: '0.875rem', background: '#FFFFFF', color: '#1F2937', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} style={{ flex: 1, padding: '0.875rem', background: isSubmitting ? '#D1D5DB' : '#FD5A47', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}>
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </>
  );
}