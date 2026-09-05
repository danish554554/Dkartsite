import React, { useEffect } from 'react';

/**
 * High-performance, zero-dependency Dynamic SEO & JSON-LD schema component
 */
export default function SEO({
  title,
  description,
  keywords,
  canonicalUrl,
  ogImage,
  ogType = 'website',
  schema
}) {
  useEffect(() => {
    // 1. Update Title
    if (title) {
      document.title = title.includes('Dkart') ? title : `${title} | Dkart.pk`;
    }

    // Helper to set or update meta tag
    const setMeta = (nameOrProperty, value, isProperty = false) => {
      if (!value) return;
      const attr = isProperty ? 'property' : 'name';
      let tag = document.querySelector(`meta[${attr}="${nameOrProperty}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attr, nameOrProperty);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', value);
    };

    // Helper to set or update link tag
    const setLink = (rel, href) => {
      if (!href) return;
      let link = document.querySelector(`link[rel="${rel}"]`);
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', rel);
        document.head.appendChild(link);
      }
      link.setAttribute('href', href);
    };

    // 2. Meta Description & Keywords
    if (description) setMeta('description', description);
    if (keywords) setMeta('keywords', keywords);

    // 3. Canonical URL
    if (canonicalUrl) {
      setLink('canonical', canonicalUrl);
      setMeta('og:url', canonicalUrl, true);
      setMeta('twitter:url', canonicalUrl);
    }

    // 4. OpenGraph & Twitter Cards
    if (title) {
      setMeta('og:title', title, true);
      setMeta('twitter:title', title);
    }
    if (description) {
      setMeta('og:description', description, true);
      setMeta('twitter:description', description);
    }
    if (ogImage) {
      const fullImg = ogImage.startsWith('http') ? ogImage : `https://www.dkart.pk${ogImage}`;
      setMeta('og:image', fullImg, true);
      setMeta('twitter:image', fullImg);
      setMeta('twitter:card', 'summary_large_image');
    }
    if (ogType) {
      setMeta('og:type', ogType, true);
    }

    // 5. Inject JSON-LD Schema
    let scriptTag = null;
    if (schema) {
      scriptTag = document.createElement('script');
      scriptTag.type = 'application/ld+json';
      scriptTag.id = 'dynamic-page-schema';
      scriptTag.text = JSON.stringify(schema);
      document.head.appendChild(scriptTag);
    }

    return () => {
      if (scriptTag && scriptTag.parentNode) {
        scriptTag.parentNode.removeChild(scriptTag);
      }
    };
  }, [title, description, keywords, canonicalUrl, ogImage, ogType, schema]);

  return null;
}
