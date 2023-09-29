import {
  annotateElWithAnalyticsTracking,
  createAnnotatedLinkEl,
  createEl,
  getPlaceholder,
} from '../../scripts/scripts.js';
import {
  decorateIcons,
  getMetadata,
  loadScript,
  fetchPlaceholders,
} from '../../scripts/lib-franklin.js';
import {
  ANALYTICS_LINK_TYPE_DOWNLOADABLE,
  ANALYTICS_LINK_TYPE_ENGAGEMENT,
  ANALYTICS_LINK_TYPE_SHARE_INTENT,
  ANALYTICS_MODULE_DOWNLOAD_ARTICLE,
  ANALYTICS_MODULE_INDUSTRY_TAGS,
  ANALYTICS_MODULE_SHARE,
  ANALYTICS_MODULE_SUBJECT_TAGS,
  ANALYTICS_TEMPLATE_ZONE_RIGHT_RAIL,
} from '../../scripts/constants.js';

async function generatePDF(pageTitle) {
  // Source HTMLElement or a string containing HTML.
  const main = document.querySelector('main').cloneNode(true);
  const heroContainer = main.querySelector('.section.hero-container');
  const asideContainer = main.querySelector('.aside-container');
  heroContainer.remove();
  asideContainer.remove();
  const pageName = pageTitle.replace(/[^a-z0-9]/gi, '-');

  const { jsPDF } = window.jspdf;
  // eslint-disable-next-line new-cap
  const doc = new jsPDF();
  await doc.html(main, {
    // eslint-disable-next-line no-shadow
    callback(doc) {
      // Save the PDF
      doc.save(`${pageName}`);
    },
    margin: [10, 10, 10, 10],
    autoPaging: 'text',
    x: 0,
    y: 0,
    width: 190, // target width in the PDF document
    windowWidth: 900, // window width in CSS pixels
  });
}

export default async function decorate(block) {
  block.innerText = '';
  const pageUrl = window.location.href;
  const pageTitle = getMetadata('og:title');
  const placeholders = await fetchPlaceholders();
  const pShare = getPlaceholder('share', placeholders);
  const pDownloadPressRelease = getPlaceholder('downloadPressRelease', placeholders);
  const pIndustryTags = getPlaceholder('industryTags', placeholders);
  const pSubjectTags = getPlaceholder('subjectTags', placeholders);

  // Create social share icons
  const social = createEl('div', { class: 'social' });

  // Linkedin
  const linkedinShareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${pageUrl}&title=${pageTitle}`;
  const linkedinShare = createAnnotatedLinkEl(
    linkedinShareUrl,
    'linkedin',
    ANALYTICS_MODULE_SHARE,
    ANALYTICS_TEMPLATE_ZONE_RIGHT_RAIL,
    ANALYTICS_LINK_TYPE_SHARE_INTENT,
  );
  linkedinShare.innerHTML = '<span class="icon icon-social-linkedin" />';
  linkedinShare.setAttribute('onclick', "return !window.open(this.href, 'Linkedin', 'width=640,height=580')");
  createEl('div', { class: 'linkedin-share' }, linkedinShare, social);

  // Twitter
  const twitterUrl = `https://twitter.com/share?text=${pageTitle}&url=${pageUrl}`;
  const twitterShare = createAnnotatedLinkEl(
    twitterUrl,
    'twitter',
    ANALYTICS_MODULE_SHARE,
    ANALYTICS_TEMPLATE_ZONE_RIGHT_RAIL,
    ANALYTICS_LINK_TYPE_SHARE_INTENT,
  );
  twitterShare.innerHTML = '<span class="icon icon-social-twitter" />';
  twitterShare.setAttribute('onclick', "return !window.open(this.href, 'Twitter', 'width=640,height=580')");
  createEl('div', { class: 'twitter-share' }, twitterShare, social);

  // Facebook
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}&display=popup&ref=plugin&src=share_button`;
  const facebookShare = createAnnotatedLinkEl(
    facebookUrl,
    'facebook',
    ANALYTICS_MODULE_SHARE,
    ANALYTICS_TEMPLATE_ZONE_RIGHT_RAIL,
    ANALYTICS_LINK_TYPE_SHARE_INTENT,
  );
  facebookShare.innerHTML = '<span class="icon icon-social-facebook" />';
  facebookShare.setAttribute('onclick', "return !window.open(this.href, 'Facebook', 'width=640,height=580')");
  createEl('div', { class: 'facebook-share' }, facebookShare, social);

  // Email
  const emailUrl = `mailto:?subject=${pageTitle}&body=Read this from Accenture Newsroom: ${pageUrl}`;
  const emailShare = createAnnotatedLinkEl(
    emailUrl,
    'email',
    ANALYTICS_MODULE_SHARE,
    ANALYTICS_TEMPLATE_ZONE_RIGHT_RAIL,
    ANALYTICS_LINK_TYPE_SHARE_INTENT,
  );
  emailShare.innerHTML = '<span class="icon icon-social-email" />';
  emailShare.target = '_blank';
  createEl('div', { class: 'email-share' }, emailShare, social);

  // Print
  const printShare = createAnnotatedLinkEl(
    // eslint-disable-next-line no-script-url
    'javascript:void(0)',
    'print',
    ANALYTICS_MODULE_SHARE,
    ANALYTICS_TEMPLATE_ZONE_RIGHT_RAIL,
    ANALYTICS_LINK_TYPE_SHARE_INTENT,
  );
  printShare.innerHTML = '<span class="icon icon-social-print" />';
  printShare.setAttribute('onclick', 'window.print()');
  createEl('div', { class: 'print-share' }, printShare, social);

  await decorateIcons(social);
  const share = createEl('div', { class: 'share' }, social);
  const shareTitle = createEl('h4', {}, pShare);
  share.prepend(shareTitle);
  block.append(share);

  // PDF Download button
  const addPDF = getMetadata('pdf');
  if (addPDF && (addPDF === 'true')) {
    const pdfButton = createEl('a', { class: 'pdf-button button', title: ' Convert to PDF' }, pDownloadPressRelease, share);
    annotateElWithAnalyticsTracking(
      pdfButton,
      pdfButton.textContent,
      ANALYTICS_MODULE_DOWNLOAD_ARTICLE,
      ANALYTICS_TEMPLATE_ZONE_RIGHT_RAIL,
      ANALYTICS_LINK_TYPE_DOWNLOADABLE,
    );
    pdfButton.addEventListener('click', async () => {
      // Add the js2pdf script
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
      await loadScript('/scripts/html2canvas.min.js');
      if (window.jspdf) {
        await generatePDF(pageTitle);
      }
    });
  }

  // Tags
  const industryTagValues = getMetadata('industries');
  const subjectTagValues = getMetadata('subjects');
  const industryEl = industryTagValues ? createEl('div', { class: 'industry' }, `<h4>${pIndustryTags}</h4>`) : null;
  const subjectEl = subjectTagValues ? createEl('div', { class: 'subject' }, `<h4>${pSubjectTags}</h4>`) : null;

  const industryUl = industryEl ? createEl('ul', {}, '', industryEl) : null;
  industryTagValues.split(',').forEach((industryTag) => {
    const cleanedUpValue = industryTag.trim().toLowerCase().replace(/[\W_]+/g, '-');
    const link = createEl('a', { href: `/industries/${cleanedUpValue}` }, industryTag);
    annotateElWithAnalyticsTracking(
      link,
      link.textContent,
      ANALYTICS_MODULE_INDUSTRY_TAGS,
      ANALYTICS_TEMPLATE_ZONE_RIGHT_RAIL,
      ANALYTICS_LINK_TYPE_ENGAGEMENT,
    );
    createEl('li', { class: 'industry-tag' }, link, industryUl);
  });

  const subjectUl = subjectEl ? createEl('ul', {}, '', subjectEl) : null;
  subjectTagValues.split(',').forEach((subjectTag) => {
    const cleanedUpValue = subjectTag.trim().toLowerCase().replace(/&/g, 'and')
      .replace(/[/]/g, '')
      .replace(/[\W_]+/g, '-');
    const link = createEl('a', { href: `/subjects/${cleanedUpValue}` }, subjectTag);
    annotateElWithAnalyticsTracking(
      link,
      link.textContent,
      ANALYTICS_MODULE_SUBJECT_TAGS,
      ANALYTICS_TEMPLATE_ZONE_RIGHT_RAIL,
      ANALYTICS_LINK_TYPE_ENGAGEMENT,
    );
    createEl('li', { class: 'subject-tag' }, link, subjectUl);
  });

  const tags = createEl('div', { class: 'tags' });
  if (industryEl) {
    tags.append(industryEl);
  }
  if (subjectEl) {
    tags.append(subjectEl);
  }
  block.append(tags);
}
