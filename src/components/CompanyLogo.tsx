import React from 'react';

interface CompanyLogoProps {
  company: string;
  size?: number;
  className?: string;
  showName?: boolean;
}

export const CompanyLogo: React.FC<CompanyLogoProps> = ({
  company,
  size = 20,
  className = '',
  showName = false
}) => {
  const norm = company.trim().toLowerCase();

  const renderLogoSvg = () => {
    switch (norm) {
      case 'google':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              fill="#EA4335"
            />
          </svg>
        );

      case 'amazon':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <path
              d="M13.92 14.16c-2.31 1.7-5.69 2.59-8.62 1.48-1.02-.38-2.06-1.01-2.92-1.77-.21-.19-.05-.44.2-.3 2.65 1.51 5.92 1.83 8.87.61.43-.18.84.28.47-.02z"
              fill="#FF9900"
            />
            <path
              d="M14.65 13.06c-.29-.37-1.92-.17-2.66-.08-.22.03-.26-.14-.06-.27 1.34-.86 3.53-.61 3.79-.29.25.32-.07 2.53-1.34 3.49-.19.14-.37.07-.29-.12.31-.76.85-2.36.56-2.73z"
              fill="#FF9900"
            />
            <path
              d="M13.43 6.22c-.22-.38-.63-.6-.89-.34l-5.6 5.56c-.24.24-.13.62.2.62h2.24v4.44c0 .33.27.6.6.6h1.77c.33 0 .6-.27.6-.6v-8.87c0-.57-.42-1.03-.92-1.41z"
              fill="#232F3E"
            />
          </svg>
        );

      case 'meta':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <path
              d="M12 7.03c-2.02 0-3.6 1.39-4.8 3.12C5.9 8.28 4.4 7.03 2.62 7.03 1.17 7.03 0 8.21 0 9.68c0 3.77 4.19 7.29 7.08 7.29 2.03 0 3.6-1.4 4.81-3.13 1.3 1.88 2.8 3.13 4.58 3.13 1.45 0 2.63-1.18 2.63-2.65 0-3.77-4.2-7.29-7.1-7.29zm-5.02 7.74c-1.89 0-4.63-2.48-4.63-5.09 0-.66.52-1.19 1.17-1.19 1.33 0 2.47 1.05 3.46 2.49v3.79zm10.04 0c-.99-1.44-2.13-2.49-3.46-2.49v-3.79c1.89 0 4.63 2.48 4.63 5.09 0 .66-.52 1.19-1.17 1.19z"
              fill="#0668E1"
            />
          </svg>
        );

      case 'microsoft':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <rect x="2" y="2" width="9" height="9" fill="#F25022" rx="1" />
            <rect x="13" y="2" width="9" height="9" fill="#7FBA00" rx="1" />
            <rect x="2" y="13" width="9" height="9" fill="#00A4EF" rx="1" />
            <rect x="13" y="13" width="9" height="9" fill="#FFB900" rx="1" />
          </svg>
        );

      case 'apple':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.65-.79 1.09-1.89.97-2.99-.95.04-2.1.63-2.77 1.42-.58.68-1.1 1.79-.96 2.87 1.06.08 2.14-.53 2.76-1.3z" />
          </svg>
        );

      case 'netflix':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <path d="M4 2v20l4-3.5V2H4z" fill="#B81D24" />
            <path d="M16 2v20l4-3.5V2h-4z" fill="#B81D24" />
            <path d="M4 2h4l8 16.5V22l-8-4.5L4 2z" fill="#E50914" />
          </svg>
        );

      case 'uber':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <rect width="24" height="24" rx="6" fill="#000000" />
            <circle cx="12" cy="12" r="5.5" stroke="#FFFFFF" strokeWidth="2.4" fill="none" />
            <rect x="11.5" y="10" width="4.5" height="4" fill="#FFFFFF" rx="0.5" />
          </svg>
        );

      case 'stripe':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <rect width="24" height="24" rx="6" fill="#635BFF" />
            <path
              d="M13.5 9.5c0-.8-.7-1.2-1.8-1.2-1.6 0-3.3.6-4.4 1.3V6.7c1.3-.6 3-1 4.7-1 3.5 0 5.6 1.8 5.6 4.8 0 4.7-6.4 3.9-6.4 5.9 0 .9.8 1.3 2 1.3 1.8 0 3.8-.8 4.9-1.6v2.9c-1.4.7-3.2 1.1-5.1 1.1-3.6 0-5.9-1.8-5.9-4.8 0-4.9 6.4-4.1 6.4-5.8z"
              fill="#FFFFFF"
            />
          </svg>
        );

      case 'adobe':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <rect width="24" height="24" rx="5" fill="#FA0F00" />
            <path d="M15.1 4H20v16l-4.9-16zM8.9 4H4v16l4.9-16zm3.1 7.2L15.6 20h-2.9l-1.6-3.8h-2.9l2.7-5z" fill="#FFFFFF" />
          </svg>
        );

      case 'atlassian':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <path
              d="M11.3 13.7c-.3-.5-.4-1.1-.3-1.6.4-1.9 2-3.4 3.9-3.8 2.2-.4 4.3.7 5.1 2.8.2.5.3 1.1.2 1.6-.4 1.9-2 3.4-3.9 3.8-2.3.4-4.4-.7-5-2.8z"
              fill="#0052CC"
            />
            <path
              d="M3.7 10.3c.3.5.4 1.1.3 1.6-.4 1.9-2 3.4-3.9 3.8-2.2.4-4.3-.7-5.1-2.8-.2-.5-.3-1.1-.2-1.6.4-1.9 2-3.4 3.9-3.8 2.3-.4 4.4.7 5 2.8z"
              fill="#2684FF"
              transform="matrix(-1 0 0 -1 15 24)"
            />
          </svg>
        );

      case 'twitter':
      case 'x':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        );

      case 'cloudflare':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <path
              d="M18.3 10.5c-.3-2.5-2.4-4.5-5-4.5-2.1 0-3.9 1.3-4.6 3.2C8.3 9.1 7.9 9 7.5 9 5.6 9 4 10.6 4 12.5c0 .3 0 .6.1.9C2.9 13.9 2 15.3 2 17c0 2.2 1.8 4 4 4h12.5c2.5 0 4.5-2 4.5-4.5 0-2.3-1.7-4.2-4-4.5l-.7-1.5z"
              fill="#F38020"
            />
            <path
              d="M17.8 13.2c-.2 0-.3.1-.4.2l-.3.9c-.1.3-.4.5-.7.5h-9c-.3 0-.5-.2-.5-.5 0-.1 0-.2.1-.3l.4-.9c.1-.2 0-.5-.2-.6-.2-.1-.5 0-.6.2l-.5 1.1c-.2.4-.1.9.2 1.2.2.2.5.4.8.4h9.3c.4 0 .8-.2 1-.5.3-.4.3-.9.1-1.3l-.3-.7c-.1-.1-.2-.2-.4-.2z"
              fill="#FAAD3F"
            />
          </svg>
        );

      case 'bloomberg':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <rect width="24" height="24" rx="5" fill="#1D2A44" />
            <path
              d="M8 6h4.5c2.5 0 4.5 1.5 4.5 3.5 0 1.2-.7 2.3-1.8 2.9 1.4.6 2.3 1.8 2.3 3.3 0 2.2-2 3.8-4.8 3.8H8V6zm3 5.5h1.5c1 0 1.8-.7 1.8-1.5s-.8-1.5-1.8-1.5H11v3zm0 5.5h1.8c1.2 0 2.2-.7 2.2-1.8s-1-1.8-2.2-1.8H11V17z"
              fill="#FFFFFF"
            />
          </svg>
        );

      case 'twilio':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="#F22F46" />
            <circle cx="9" cy="9" r="2.2" fill="#FFFFFF" />
            <circle cx="15" cy="9" r="2.2" fill="#FFFFFF" />
            <circle cx="9" cy="15" r="2.2" fill="#FFFFFF" />
            <circle cx="15" cy="15" r="2.2" fill="#FFFFFF" />
          </svg>
        );

      case 'flipkart':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <rect width="24" height="24" rx="6" fill="#2874F0" />
            <path
              d="M7 6h10l-1 12H8L7 6zm3 3v2h4V9h-4zm0 3v2h3v-2h-3z"
              fill="#FFE500"
            />
          </svg>
        );

      case 'swiggy':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <rect width="24" height="24" rx="6" fill="#FC8019" />
            <path
              d="M12 4C8.7 4 6 6.7 6 10c0 4.5 6 10 6 10s6-5.5 6-10c0-3.3-2.7-6-6-6zm1.2 8.8c-.8.5-1.9.3-2.4-.5-.3-.4-.3-.9-.2-1.3l.8-2.5c.2-.5.7-.8 1.2-.8h.8c.8 0 1.5.7 1.5 1.5 0 .5-.2.9-.6 1.2l-1.1.9z"
              fill="#FFFFFF"
            />
          </svg>
        );

      case 'razorpay':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <rect width="24" height="24" rx="6" fill="#0C2340" />
            <path
              d="M7 17l4.5-10h4.5l-3.2 5.5 4.2 4.5h-4.5L9.8 14.2 8.6 17H7z"
              fill="#3395FF"
            />
          </svg>
        );

      case 'airbnb':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <rect width="24" height="24" rx="6" fill="#FF5A5F" />
            <path
              d="M12 5c-2.3 0-4 2.6-3.4 5.3 1 4.5 3.4 7.7 3.4 7.7s2.4-3.2 3.4-7.7C16 7.6 14.3 5 12 5zm0 8.5c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5z"
              fill="#FFFFFF"
            />
          </svg>
        );

      case 'spotify':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="#1ED760" />
            <path
              d="M16.5 14.8c-.2.3-.5.4-.8.2-2.2-1.3-4.9-1.6-8.1-.9-.3.1-.7-.1-.7-.4-.1-.3.1-.7.4-.7 3.5-.8 6.5-.4 9 1.1.3.2.4.5.2.7zm1.1-2.4c-.2.4-.7.5-1.1.2-2.5-1.5-6.3-2-9.2-1.1-.4.1-.9-.1-1-.5-.1-.4.1-.9.5-1 3.4-1 7.6-.5 10.5 1.3.4.2.5.7.3 1.1zm.1-2.5c-3-1.8-8-2-10.8-1.1-.5.1-1-.1-1.2-.6-.1-.5.1-1 .6-1.2 3.4-1 8.9-.8 12.4 1.3.4.3.6.8.3 1.3-.3.4-.9.6-1.3.3z"
              fill="#FFFFFF"
            />
          </svg>
        );

      case 'linkedin':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <rect width="24" height="24" rx="5" fill="#0A66C2" />
            <path
              d="M7.5 9h-3v9h3V9zm-1.5-4.5c-1 0-1.8.8-1.8 1.8s.8 1.8 1.8 1.8 1.8-.8 1.8-1.8-.8-1.8-1.8-1.8zM19.5 13.5v4.5h-3v-4.2c0-1-.4-1.7-1.3-1.7-.7 0-1.1.5-1.3.9v5H11s.04-8.2 0-9h2.9v1.3c.4-.6 1.1-1.5 2.7-1.5 2 0 3.5 1.3 3.5 4.1l-.6.6z"
              fill="#FFFFFF"
            />
          </svg>
        );

      case 'salesforce':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <rect width="24" height="24" rx="6" fill="#00A1E0" />
            <path
              d="M10.2 7.5c.8-.9 2-1.5 3.3-1.5 1.9 0 3.5 1.2 4.1 2.9.7.2 1.4.7 1.8 1.3.6.8.9 1.8.9 2.8 0 2.5-2 4.5-4.5 4.5H8.2C5.9 17.5 4 15.6 4 13.3c0-1.8 1.1-3.3 2.7-3.9.1-1.1.7-2 1.5-2.7.5.5 1.3.8 2 .8z"
              fill="#FFFFFF"
            />
          </svg>
        );

      default:
        return (
          <div
            style={{
              width: size,
              height: size,
              borderRadius: '6px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: `${Math.max(10, size * 0.5)}px`,
              fontWeight: 800,
              textTransform: 'uppercase'
            }}
          >
            {company.charAt(0)}
          </div>
        );
    }
  };

  if (!showName) {
    return (
      <span
        className={`company-logo-icon ${className}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          verticalAlign: 'middle',
          flexShrink: 0
        }}
        title={company}
      >
        {renderLogoSvg()}
      </span>
    );
  }

  return (
    <span
      className={`company-badge-pill ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '7px',
        padding: '4px 10px',
        borderRadius: '8px',
        background: 'var(--bg-surface-subtle, #f8fafc)',
        border: '1px solid var(--border-subtle, #e2e8f0)',
        fontSize: '0.8rem',
        fontWeight: 600,
        color: 'var(--text-primary, #0f172a)'
      }}
      title={`Asked in ${company} interviews`}
    >
      {renderLogoSvg()}
      <span>{company}</span>
    </span>
  );
};

interface CompanyAvatarStackProps {
  companies: string[];
  size?: number;
  maxVisible?: number;
  className?: string;
}

export const CompanyAvatarStack: React.FC<CompanyAvatarStackProps> = ({
  companies,
  size = 28,
  maxVisible = 5,
  className = ''
}) => {
  // Filter out any +N count strings that might be in the array
  const cleanCompanies = companies.filter((c) => !c.startsWith('+'));
  const visible = cleanCompanies.slice(0, maxVisible);
  const overflow = cleanCompanies.length - maxVisible;

  const overlapMargin = -Math.round(size * 0.28);

  return (
    <div
      className={`company-avatar-stack ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        paddingLeft: `${Math.abs(overlapMargin)}px`,
        position: 'relative'
      }}
    >
      {visible.map((comp, idx) => (
        <div
          key={comp + idx}
          className="company-avatar-wrapper"
          style={{
            position: 'relative',
            marginLeft: idx > 0 ? `${overlapMargin}px` : '0px',
            zIndex: visible.length - idx
          }}
        >
          <div
            className="company-avatar-item"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              borderRadius: '50%',
              background: 'var(--bg-surface, #ffffff)',
              border: '2px solid var(--bg-surface, #ffffff)',
              boxShadow: '0 2px 6px rgba(15, 23, 42, 0.12)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              overflow: 'hidden',
              flexShrink: 0
            }}
          >
            <CompanyLogo company={comp} size={Math.round(size * 0.68)} />
          </div>

          {/* Animated Hover Tooltip with Company Name */}
          <div className="company-avatar-tooltip">
            <span>{comp}</span>
          </div>
        </div>
      ))}

      {overflow > 0 && (
        <div
          className="company-avatar-wrapper"
          style={{
            position: 'relative',
            marginLeft: `${overlapMargin}px`,
            zIndex: 0
          }}
        >
          <div
            className="company-avatar-overflow"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              borderRadius: '50%',
              background: 'var(--bg-surface-subtle, #f1f5f9)',
              border: '2px solid var(--bg-surface, #ffffff)',
              boxShadow: '0 2px 6px rgba(15, 23, 42, 0.12)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: `${Math.round(size * 0.38)}px`,
              fontWeight: 800,
              color: 'var(--text-secondary, #475569)',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            +{overflow}
          </div>

          <div className="company-avatar-tooltip">
            <span>{cleanCompanies.slice(maxVisible).join(', ')}</span>
          </div>
        </div>
      )}
    </div>
  );
};
