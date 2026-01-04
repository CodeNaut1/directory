import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import twitterIcon from '../assets/twitter-icon.png';
import linkedInIcon from '../assets/linkedIn-icon.png';
import nostrIcon from '../assets/nostr-icon.png';
import instagramIcon from '../assets/instagram-icon.png';
import bitcoinIcon from '../assets/bitcoin-icon.png';
import lightningIcon from '../assets/lightning-icon.png';

interface Country {
  id: string;
  name: string;
  code: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
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
  longDescription: string;
  initiatives: string;
  impact: string;
  challenges: string;
  websiteUrl: string;
  email: string;
  phone: string;
  foundedYear: string;
  founderName: string;
  founderTwitter: string;
  founderEmail: string;
  twitterHandle: string;
  linkedinUsername: string;
  facebookUsername: string;
  youtubeChannel: string;
  telegramGroup: string;
  nostrAddress: string;
  instagramUsername: string;
  projectLogo: File | null;
}

export default function CreateProject() {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || '';

  const [countries, setCountries] = useState<Country[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [formData, setFormData] = useState<FormData>({
    projectName: '',
    countryId: '',
    categoryId: '',
    selectedTags: [],
    bitcoinOnchain: false,
    lightning: false,
    giftCards: false,
    description: '',
    longDescription: '',
    initiatives: '',
    impact: '',
    challenges: '',
    websiteUrl: '',
    email: '',
    phone: '',
    foundedYear: '',
    founderName: '',
    founderTwitter: '',
    founderEmail: '',
    twitterHandle: '',
    linkedinUsername: '',
    facebookUsername: '',
    youtubeChannel: '',
    telegramGroup: '',
    nostrAddress: '',
    instagramUsername: '',
    projectLogo: null,
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.title = "Create Project - African Bitcoin Directory";
  }, []);

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

          if (countriesData.success && countriesData.data) {
            setCountries(countriesData.data);
          }
          if (categoriesData.success && categoriesData.data) {
            setCategories(categoriesData.data);
          }
          if (tagsData.success && tagsData.data) {
            setTags(tagsData.data);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [API_URL]);

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

  const handleTagToggle = (tagId: string) => {
    setFormData((prev) => {
      const isSelected = prev.selectedTags.includes(tagId);

      if (isSelected) {
        return {
          ...prev,
          selectedTags: prev.selectedTags.filter(id => id !== tagId),
        };
      } else {
        if (prev.selectedTags.length >= 6) {
          return prev;
        }
        return {
          ...prev,
          selectedTags: [...prev.selectedTags, tagId],
        };
      }
    });
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

    // Required fields only
    if (!formData.projectName.trim()) {
      newErrors.projectName = 'Project name is required';
    }
    if (!formData.countryId) {
      newErrors.countryId = 'Country is required';
    }
    if (!formData.categoryId) {
      newErrors.categoryId = 'Category is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Project description is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Optional field validation (only if provided)
    if (formData.websiteUrl && formData.websiteUrl.trim()) {
      const urlPattern = /^(https?:\/\/)?([\w.-]+\.[a-z]{2,})(\/.*)?$/i;
      if (!urlPattern.test(formData.websiteUrl.trim())) {
        newErrors.websiteUrl = 'Please enter a valid website URL';
      }
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
      const token = localStorage.getItem('access_token');

      if (!token) {
        alert('You must be logged in to submit a project');
        navigate('/login');
        return;
      }

      let normalizedUrl = formData.websiteUrl.trim();
      if (normalizedUrl && !normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
        normalizedUrl = `https://${normalizedUrl}`;
      }

      const socialLinks: Record<string, string> = {};

      if (formData.twitterHandle) {
        const handle = formData.twitterHandle.replace('@', '').trim();
        socialLinks.twitter = `https://twitter.com/${handle}`;
      }

      if (formData.linkedinUsername) {
        const username = formData.linkedinUsername.trim();
        socialLinks.linkedin = username.startsWith('http')
          ? username
          : `https://linkedin.com/in/${username}`;
      }

      if (formData.facebookUsername) {
        const username = formData.facebookUsername.trim();
        socialLinks.facebook = username.startsWith('http')
          ? username
          : `https://facebook.com/${username}`;
      }

      if (formData.nostrAddress) {
        const address = formData.nostrAddress.trim();
        socialLinks.nostr = address.startsWith('http') ? address : `https://njump.me/${address}`;
      }

      if (formData.instagramUsername) {
        const username = formData.instagramUsername.replace('@', '').trim();
        socialLinks.instagram = `https://instagram.com/${username}`;
      }

      if (formData.youtubeChannel) {
        const channel = formData.youtubeChannel.trim();
        socialLinks.youtube = channel.startsWith('http') ? channel : `https://youtube.com/${channel}`;
      }

      if (formData.telegramGroup) {
        const group = formData.telegramGroup.trim();
        socialLinks.telegram = group.startsWith('http') ? group : `https://t.me/${group}`;
      }

      const payload = {
        name: formData.projectName,
        description: formData.description,
        website: normalizedUrl || undefined,
        countryId: formData.countryId,
        categoryId: formData.categoryId,
        foundedYear: formData.foundedYear || undefined,
        tagIds: formData.selectedTags.length > 0 ? formData.selectedTags : undefined,
        details: {
          contactEmail: formData.email,
          contactPhone: formData.phone || undefined,
          socialLinks: Object.keys(socialLinks).length > 0 ? socialLinks : undefined,
          bitcoinOnly: formData.bitcoinOnchain,
          lightningNetwork: formData.lightning,
          giftCards: formData.giftCards,
          longDescription: formData.longDescription.trim() || undefined,
          initiatives: formData.initiatives.trim() || undefined,
          impact: formData.impact.trim() || undefined,
          challenges: formData.challenges.trim() || undefined,
          founderName: formData.founderName.trim() || undefined,
          founderTwitter: formData.founderTwitter.trim() ?
            (formData.founderTwitter.trim().startsWith('http') ?
              formData.founderTwitter.trim() :
              `https://twitter.com/${formData.founderTwitter.replace('@', '').trim()}`) : undefined,
          founderEmail: formData.founderEmail.trim() || undefined,
        },
      };

      let response;

      if (formData.projectLogo) {
        const formDataToSend = new FormData();
        formDataToSend.append('logo', formData.projectLogo);
        formDataToSend.append('data', JSON.stringify(payload));

        response = await fetch(`${API_URL}/api/projects/submit`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formDataToSend,
        });
      } else {
        response = await fetch(`${API_URL}/api/projects/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }

      if (response.ok) {
        navigate('/project-submitted');
      } else {
        const data = await response.json();
        alert(data.error?.message || data.error || `Failed to submit project. Please try again.`);
      }
    } catch (error) {
      console.error('Error submitting project:', error);
      alert('An error occurred while submitting your project. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingData) {
    return (
      <main className="app-main" style={{ background: '#F5F5F5', minHeight: '100vh', padding: 'clamp(2rem, 5vw, 4rem) clamp(1rem, 4vw, 1rem)' }}>
        <div className="container" style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <p>Loading form...</p>
        </div>
      </main>
    );
  }

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .steps-grid {
            grid-template-columns: 1fr !important;
          }
          .form-grid-2 {
            grid-template-columns: 1fr !important;
          }
          .form-grid-3 {
            grid-template-columns: 1fr !important;
          }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .form-grid-3 {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>

      <main className="app-main" style={{ background: '#F5F5F5', minHeight: '100vh', padding: 'clamp(2rem, 5vw, 4rem) clamp(1rem, 4vw, 1rem)' }}>
        <div className="container" style={{ maxWidth: 900, margin: '0 auto' }}>
          {/* Steps Section */}
          <section style={{ marginBottom: '4rem', background: '#F5F5F5', padding: 'clamp(2rem, 4vw, 3rem) clamp(1rem, 3vw, 2rem)', borderRadius: '12px' }}>
            <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 1.75rem)', fontWeight: 700, color: '#1F2937', textAlign: 'center', marginBottom: 'clamp(2rem, 4vw, 3rem)' }}>
              Steps to get listed
            </h1>
            <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', maxWidth: 1000, margin: '0 auto' }}>
              {[
                { num: 1, title: 'Submit Your Details', desc: 'Fill out the form below with comprehensive information about your project.' },
                { num: 2, title: 'Internal Review', desc: 'Our team reviews your submission to ensure it meets our guidelines.' },
                { num: 3, title: 'Go Live', desc: 'Your listing becomes visible on the directory map.' }
              ].map((step) => (
                <div key={step.num} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#FD5A47', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 700, marginBottom: '-25px', position: 'relative', zIndex: 1 }}>{step.num}</div>
                  <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '2.5rem 1.5rem 1.5rem', marginTop: '25px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)', width: '100%' }}>
                    <h3 style={{ fontSize: 'clamp(0.9rem, 2vw, 1rem)', fontWeight: 700, color: '#1F2937', marginBottom: '0.75rem', textAlign: 'left' }}>{step.title}</h3>
                    <p style={{ fontSize: 'clamp(0.8rem, 1.5vw, 0.875rem)', color: '#4B5563', lineHeight: 1.6, margin: 0, textAlign: 'left' }}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Form Section */}
          <section style={{ background: '#FFFFFF', borderRadius: '12px', padding: 'clamp(2rem, 4vw, 3rem)', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 1.75rem)', fontWeight: 700, color: '#1F2937', marginBottom: '2.5rem' }}>Project Listing Form</h2>

            <form onSubmit={handleSubmit}>
              {/* SECTION 1: BASIC INFO */}
              <div style={{ marginBottom: '3rem', padding: '1.5rem', background: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1F2937', marginBottom: '1.5rem' }}>Basic Information</h3>

                {/* Logo */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label htmlFor="projectLogo" style={{ display: 'block', fontSize: '0.9375rem', fontWeight: 600, color: '#1F2937', marginBottom: '0.5rem' }}>
                    Project Logo <span style={{ color: '#6B7280', fontWeight: 400 }}>(Optional)</span>
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input type="file" id="projectLogo" name="projectLogo" accept="image/*" onChange={handleLogoChange} style={{ fontSize: '0.9375rem', cursor: 'pointer', width: '100%' }} />
                    {logoPreview && <img src={logoPreview} alt="Logo preview" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #D1D5DB' }} />}
                  </div>
                </div>

                {/* Name */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label htmlFor="projectName" style={{ display: 'block', fontSize: '0.9375rem', fontWeight: 600, color: '#1F2937', marginBottom: '0.5rem' }}>
                    Project / Business Name <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input type="text" id="projectName" name="projectName" value={formData.projectName} onChange={handleChange} placeholder="e.g African Bitcoiners" style={{ width: '100%', padding: '0.875rem 1rem', fontSize: '0.9375rem', border: errors.projectName ? '2px solid #EF4444' : '1px solid #D1D5DB', borderRadius: '8px', outline: 'none', background: '#FFFFFF', color: '#1F2937' }} />
                  {errors.projectName && <p style={{ color: '#EF4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.projectName}</p>}
                </div>

                {/* Country, Category & Founded Year */}
                <div className="form-grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label htmlFor="countryId" style={{ display: 'block', fontSize: '0.9375rem', fontWeight: 600, color: '#1F2937', marginBottom: '0.5rem' }}>
                      Country <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <select id="countryId" name="countryId" value={formData.countryId} onChange={handleChange} style={{ width: '100%', padding: '0.875rem 1rem', fontSize: '0.9375rem', border: errors.countryId ? '2px solid #EF4444' : '1px solid #D1D5DB', borderRadius: '8px', background: '#FFFFFF', cursor: 'pointer' }}>
                      <option value="">Select a country</option>
                      {countries.map((country) => <option key={country.id} value={country.id}>{country.name}</option>)}
                    </select>
                    {errors.countryId && <p style={{ color: '#EF4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.countryId}</p>}
                  </div>
                  <div>
                    <label htmlFor="categoryId" style={{ display: 'block', fontSize: '0.9375rem', fontWeight: 600, color: '#1F2937', marginBottom: '0.5rem' }}>
                      Category <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <select id="categoryId" name="categoryId" value={formData.categoryId} onChange={handleChange} style={{ width: '100%', padding: '0.875rem 1rem', fontSize: '0.9375rem', border: errors.categoryId ? '2px solid #EF4444' : '1px solid #D1D5DB', borderRadius: '8px', background: '#FFFFFF', cursor: 'pointer' }}>
                      <option value="">Select a category</option>
                      {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                    </select>
                    {errors.categoryId && <p style={{ color: '#EF4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.categoryId}</p>}
                  </div>
                  <div>
                    <label htmlFor="foundedYear" style={{ display: 'block', fontSize: '0.9375rem', fontWeight: 600, color: '#1F2937', marginBottom: '0.5rem' }}>
                      Founded Year <span style={{ color: '#6B7280', fontWeight: 400 }}>(Optional)</span>
                    </label>
                    <input type="text" id="foundedYear" name="foundedYear" value={formData.foundedYear} onChange={handleChange} placeholder="e.g 2020" maxLength={4} style={{ width: '100%', padding: '0.875rem 1rem', fontSize: '0.9375rem', border: '1px solid #D1D5DB', borderRadius: '8px', background: '#FFFFFF' }} />
                  </div>
                </div>

                {/* Tags */}
                <div style={{ marginBottom: 0 }}>
                  <label style={{ display: 'block', fontSize: '0.9375rem', fontWeight: 600, color: '#1F2937', marginBottom: '0.75rem' }}>
                    Tags (Select up to 6) <span style={{ color: '#6B7280', fontWeight: 400 }}>(Optional)</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 400, color: '#6B7280', marginLeft: '0.5rem' }}>
                      ({formData.selectedTags.length}/6 selected)
                    </span>
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                    {tags.map((tag) => {
                      const isSelected = formData.selectedTags.includes(tag.id);
                      const isDisabled = !isSelected && formData.selectedTags.length >= 6;
                      return (
                        <button key={tag.id} type="button" onClick={() => handleTagToggle(tag.id)} disabled={isDisabled} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: 500, border: isSelected ? '2px solid #FD5A47' : '1px solid #D1D5DB', borderRadius: '9999px', background: isSelected ? '#FEF3F2' : '#FFFFFF', color: isSelected ? '#FD5A47' : '#1F2937', cursor: isDisabled ? 'not-allowed' : 'pointer', opacity: isDisabled ? 0.5 : 1, transition: 'all 0.2s' }}>
                          {tag.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* SECTION 2: BITCOIN ACCEPTANCE */}
              <div style={{ marginBottom: '3rem', padding: '1.5rem', background: '#FEF3F2', borderRadius: '8px', border: '1px solid #FECACA' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1F2937', marginBottom: '1.5rem' }}>Bitcoin Acceptance</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                    <input type="checkbox" name="bitcoinOnchain" checked={formData.bitcoinOnchain} onChange={handleChange} style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#FD5A47' }} />
                    <img src={bitcoinIcon} alt="Bitcoin" style={{ width: '20px', height: '20px' }} />
                    <span style={{ fontSize: '0.9375rem', color: '#1F2937' }}>Bitcoin Onchain</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                    <input type="checkbox" name="lightning" checked={formData.lightning} onChange={handleChange} style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#FD5A47' }} />
                    <img src={lightningIcon} alt="Lightning" style={{ width: '20px', height: '20px' }} />
                    <span style={{ fontSize: '0.9375rem', color: '#1F2937' }}>Lightning Network</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                    <input type="checkbox" name="giftCards" checked={formData.giftCards} onChange={handleChange} style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#FD5A47' }} />
                    <span style={{ fontSize: '0.9375rem', color: '#1F2937' }}>Gift Cards</span>
                  </label>
                </div>
              </div>

              {/* SECTION 3: DESCRIPTIONS */}
              <div style={{ marginBottom: '3rem', padding: '1.5rem', background: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1F2937', marginBottom: '1.5rem' }}>Project Details</h3>

                {/* Short Description */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label htmlFor="description" style={{ display: 'block', fontSize: '0.9375rem', fontWeight: 600, color: '#1F2937', marginBottom: '0.5rem' }}>
                    Short Description <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <textarea id="description" name="description" value={formData.description} onChange={handleChange} placeholder="Brief overview of your project (this appears in listings)" rows={4} style={{ width: '100%', padding: '0.875rem 1rem', fontSize: '0.9375rem', border: errors.description ? '2px solid #EF4444' : '1px solid #D1D5DB', borderRadius: '8px', resize: 'vertical', fontFamily: 'inherit', background: '#FFFFFF' }} />
                  {errors.description && <p style={{ color: '#EF4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.description}</p>}
                </div>

                {/* Long Description */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label htmlFor="longDescription" style={{ display: 'block', fontSize: '0.9375rem', fontWeight: 600, color: '#1F2937', marginBottom: '0.5rem' }}>
                    Full Description <span style={{ color: '#6B7280', fontWeight: 400 }}>(Optional)</span>
                  </label>
                  <textarea id="longDescription" name="longDescription" value={formData.longDescription} onChange={handleChange} placeholder="Detailed description of your project, mission, and vision" rows={6} style={{ width: '100%', padding: '0.875rem 1rem', fontSize: '0.9375rem', border: '1px solid #D1D5DB', borderRadius: '8px', resize: 'vertical', fontFamily: 'inherit', background: '#FFFFFF' }} />
                </div>

                {/* Initiatives */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label htmlFor="initiatives" style={{ display: 'block', fontSize: '0.9375rem', fontWeight: 600, color: '#1F2937', marginBottom: '0.5rem' }}>
                    Core Initiatives <span style={{ color: '#6B7280', fontWeight: 400 }}>(Optional)</span>
                  </label>
                  <textarea id="initiatives" name="initiatives" value={formData.initiatives} onChange={handleChange} placeholder="• Education programs&#10;• Community building&#10;• Merchant adoption" rows={5} style={{ width: '100%', padding: '0.875rem 1rem', fontSize: '0.9375rem', border: '1px solid #D1D5DB', borderRadius: '8px', resize: 'vertical', fontFamily: 'inherit', background: '#FFFFFF' }} />
                  <p style={{ fontSize: '0.8125rem', color: '#6B7280', marginTop: '0.5rem' }}>List your key initiatives - use bullet points for better formatting</p>
                </div>

                {/* Impact */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label htmlFor="impact" style={{ display: 'block', fontSize: '0.9375rem', fontWeight: 600, color: '#1F2937', marginBottom: '0.5rem' }}>
                    Impact & Achievements <span style={{ color: '#6B7280', fontWeight: 400 }}>(Optional)</span>
                  </label>
                  <textarea id="impact" name="impact" value={formData.impact} onChange={handleChange} placeholder="Share your measurable impact, success stories, and achievements" rows={5} style={{ width: '100%', padding: '0.875rem 1rem', fontSize: '0.9375rem', border: '1px solid #D1D5DB', borderRadius: '8px', resize: 'vertical', fontFamily: 'inherit', background: '#FFFFFF' }} />
                </div>

                {/* Challenges */}
                <div style={{ marginBottom: 0 }}>
                  <label htmlFor="challenges" style={{ display: 'block', fontSize: '0.9375rem', fontWeight: 600, color: '#1F2937', marginBottom: '0.5rem' }}>
                    Current Challenges <span style={{ color: '#6B7280', fontWeight: 400 }}>(Optional)</span>
                  </label>
                  <textarea id="challenges" name="challenges" value={formData.challenges} onChange={handleChange} placeholder="What challenges are you currently facing?" rows={5} style={{ width: '100%', padding: '0.875rem 1rem', fontSize: '0.9375rem', border: '1px solid #D1D5DB', borderRadius: '8px', resize: 'vertical', fontFamily: 'inherit', background: '#FFFFFF' }} />
                </div>
              </div>

              {/* SECTION 4: CONTACT INFO */}
              <div style={{ marginBottom: '3rem', padding: '1.5rem', background: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1F2937', marginBottom: '1.5rem' }}>Contact Information</h3>

                <div className="form-grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label htmlFor="websiteUrl" style={{ display: 'block', fontSize: '0.9375rem', fontWeight: 600, color: '#1F2937', marginBottom: '0.5rem' }}>
                      Website <span style={{ color: '#6B7280', fontWeight: 400 }}>(Optional)</span>
                    </label>
                    <input type="text" id="websiteUrl" name="websiteUrl" value={formData.websiteUrl} onChange={handleChange} placeholder="bitcoiners.africa" style={{ width: '100%', padding: '0.875rem 1rem', fontSize: '0.9375rem', border: errors.websiteUrl ? '2px solid #EF4444' : '1px solid #D1D5DB', borderRadius: '8px', background: '#FFFFFF' }} />
                    {errors.websiteUrl && <p style={{ color: '#EF4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.websiteUrl}</p>}
                  </div>
                  <div>
                    <label htmlFor="email" style={{ display: 'block', fontSize: '0.9375rem', fontWeight: 600, color: '#1F2937', marginBottom: '0.5rem' }}>
                      Email <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="john@gmail.com" style={{ width: '100%', padding: '0.875rem 1rem', fontSize: '0.9375rem', border: errors.email ? '2px solid #EF4444' : '1px solid #D1D5DB', borderRadius: '8px', background: '#FFFFFF' }} />
                    {errors.email && <p style={{ color: '#EF4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.email}</p>}
                  </div>
                  <div>
                    <label htmlFor="phone" style={{ display: 'block', fontSize: '0.9375rem', fontWeight: 600, color: '#1F2937', marginBottom: '0.5rem' }}>
                      Phone <span style={{ color: '#6B7280', fontWeight: 400 }}>(Optional)</span>
                    </label>
                    <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="+234 800 000 0000" style={{ width: '100%', padding: '0.875rem 1rem', fontSize: '0.9375rem', border: '1px solid #D1D5DB', borderRadius: '8px', background: '#FFFFFF' }} />
                  </div>
                </div>

                <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1F2937', marginBottom: '1rem', marginTop: '2rem' }}>
                  Social Media <span style={{ color: '#6B7280', fontWeight: 400 }}>(All Optional)</span>
                </h4>

                <div className="form-grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label htmlFor="twitterHandle" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9375rem', fontWeight: 600, color: '#1F2937', marginBottom: '0.5rem' }}>
                      <img src={twitterIcon} alt="Twitter" style={{ width: '20px', height: '20px' }} />X / Twitter
                    </label>
                    <input type="text" id="twitterHandle" name="twitterHandle" value={formData.twitterHandle} onChange={handleChange} placeholder="@afribitcoiners" style={{ width: '100%', padding: '0.875rem 1rem', fontSize: '0.9375rem', border: '1px solid #D1D5DB', borderRadius: '8px', background: '#FFFFFF' }} />
                  </div>
                  <div>
                    <label htmlFor="linkedinUsername" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9375rem', fontWeight: 600, color: '#1F2937', marginBottom: '0.5rem' }}>
                      <img src={linkedInIcon} alt="LinkedIn" style={{ width: '20px', height: '20px' }} />LinkedIn
                    </label>
                    <input type="text" id="linkedinUsername" name="linkedinUsername" value={formData.linkedinUsername} onChange={handleChange} placeholder="African Bitcoiners" style={{ width: '100%', padding: '0.875rem 1rem', fontSize: '0.9375rem', border: '1px solid #D1D5DB', borderRadius: '8px', background: '#FFFFFF' }} />
                  </div>
                  <div>
                    <label htmlFor="instagramUsername" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9375rem', fontWeight: 600, color: '#1F2937', marginBottom: '0.5rem' }}>
                      <img src={instagramIcon} alt="Instagram" style={{ width: '20px', height: '20px' }} />Instagram
                    </label>
                    <input type="text" id="instagramUsername" name="instagramUsername" value={formData.instagramUsername} onChange={handleChange} placeholder="@afribitcoiners" style={{ width: '100%', padding: '0.875rem 1rem', fontSize: '0.9375rem', border: '1px solid #D1D5DB', borderRadius: '8px', background: '#FFFFFF' }} />
                  </div>
                </div>

                <div className="form-grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                  <div>
                    <label htmlFor="facebookUsername" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9375rem', fontWeight: 600, color: '#1F2937', marginBottom: '0.5rem' }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: '#1877F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: '#FFFFFF', fontSize: '0.75rem', fontWeight: 700 }}>f</span></div>Facebook
                    </label>
                    <input type="text" id="facebookUsername" name="facebookUsername" value={formData.facebookUsername} onChange={handleChange} placeholder="African Bitcoiners" style={{ width: '100%', padding: '0.875rem 1rem', fontSize: '0.9375rem', border: '1px solid #D1D5DB', borderRadius: '8px', background: '#FFFFFF' }} />
                  </div>
                  <div>
                    <label htmlFor="youtubeChannel" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9375rem', fontWeight: 600, color: '#1F2937', marginBottom: '0.5rem' }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: '#FF0000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: '#FFFFFF', fontSize: '0.7rem', fontWeight: 700 }}>▶</span></div>YouTube
                    </label>
                    <input type="text" id="youtubeChannel" name="youtubeChannel" value={formData.youtubeChannel} onChange={handleChange} placeholder="@afribitcoiners" style={{ width: '100%', padding: '0.875rem 1rem', fontSize: '0.9375rem', border: '1px solid #D1D5DB', borderRadius: '8px', background: '#FFFFFF' }} />
                  </div>
                  <div>
                    <label htmlFor="telegramGroup" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9375rem', fontWeight: 600, color: '#1F2937', marginBottom: '0.5rem' }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: '#0088cc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: '#FFFFFF', fontSize: '0.7rem', fontWeight: 700 }}>✈</span></div>Telegram
                    </label>
                    <input type="text" id="telegramGroup" name="telegramGroup" value={formData.telegramGroup} onChange={handleChange} placeholder="afribitcoiners" style={{ width: '100%', padding: '0.875rem 1rem', fontSize: '0.9375rem', border: '1px solid #D1D5DB', borderRadius: '8px', background: '#FFFFFF' }} />
                  </div>
                </div>

                <div style={{ marginTop: '1.5rem' }}>
                  <label htmlFor="nostrAddress" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9375rem', fontWeight: 600, color: '#1F2937', marginBottom: '0.5rem' }}>
                    <img src={nostrIcon} alt="Nostr" style={{ width: '20px', height: '20px' }} />Nostr
                  </label>
                  <input type="text" id="nostrAddress" name="nostrAddress" value={formData.nostrAddress} onChange={handleChange} placeholder="npub1... or @afribitcoiners" style={{ width: '100%', padding: '0.875rem 1rem', fontSize: '0.9375rem', border: '1px solid #D1D5DB', borderRadius: '8px', background: '#FFFFFF' }} />
                </div>
              </div>

              {/* SECTION 5: FOUNDER INFO */}
              <div style={{ marginBottom: '3rem', padding: '1.5rem', background: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1F2937', marginBottom: '1.5rem' }}>
                  Founder Information <span style={{ color: '#6B7280', fontWeight: 400 }}>(All Optional)</span>
                </h3>

                <div className="form-grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                  <div>
                    <label htmlFor="founderName" style={{ display: 'block', fontSize: '0.9375rem', fontWeight: 600, color: '#1F2937', marginBottom: '0.5rem' }}>Founder Name</label>
                    <input type="text" id="founderName" name="founderName" value={formData.founderName} onChange={handleChange} placeholder="John Doe" style={{ width: '100%', padding: '0.875rem 1rem', fontSize: '0.9375rem', border: '1px solid #D1D5DB', borderRadius: '8px', background: '#FFFFFF' }} />
                  </div>
                  <div>
                    <label htmlFor="founderTwitter" style={{ display: 'block', fontSize: '0.9375rem', fontWeight: 600, color: '#1F2937', marginBottom: '0.5rem' }}>Founder Twitter</label>
                    <input type="text" id="founderTwitter" name="founderTwitter" value={formData.founderTwitter} onChange={handleChange} placeholder="@johndoe" style={{ width: '100%', padding: '0.875rem 1rem', fontSize: '0.9375rem', border: '1px solid #D1D5DB', borderRadius: '8px', background: '#FFFFFF' }} />
                  </div>
                  <div>
                    <label htmlFor="founderEmail" style={{ display: 'block', fontSize: '0.9375rem', fontWeight: 600, color: '#1F2937', marginBottom: '0.5rem' }}>Founder Email</label>
                    <input type="email" id="founderEmail" name="founderEmail" value={formData.founderEmail} onChange={handleChange} placeholder="john@example.com" style={{ width: '100%', padding: '0.875rem 1rem', fontSize: '0.9375rem', border: '1px solid #D1D5DB', borderRadius: '8px', background: '#FFFFFF' }} />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button type="submit" disabled={isSubmitting} style={{ width: '100%', padding: '1rem 2rem', background: isSubmitting ? '#D1D5DB' : '#FD5A47', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}>
                {isSubmitting ? 'Submitting...' : 'Submit Project for Review'}
              </button>
            </form>
          </section>
        </div>
      </main>
    </>
  );
}