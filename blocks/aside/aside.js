import { createEl } from '../../scripts/scripts.js';
import { decorateIcons, getMetadata } from '../../scripts/lib-franklin.js';

export default async function decorate(block) {
  block.innerText = '';
  const social = createEl('div', { class: 'social' });
  const pageUrl = window.location.href;
  const pageTitle = getMetadata('title');
  // Create social share icons
  // Linkedin
  const linkedinShareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${pageUrl}&title=${pageTitle}`;
  const linkedinShare = `
    <a href="${linkedinShareUrl}"
        onclick="return !window.open(this.href, 'Linkedin', 'width=640,height=580')">
        <span class="icon icon-social-linkedin" />
    </a>`;
  createEl('div', { class: 'linkedin-share' }, linkedinShare, social);

  // Twitter
  const twitterUrl = `https://twitter.com/share?text=${pageTitle}&url=${pageUrl}`;
  const twitterShare = `
    <a href="${twitterUrl}"
        onclick="return !window.open(this.href, 'Twitter', 'width=640,height=580')">
        <span class="icon icon-social-twitter" />
    </a>`;
  createEl('div', { class: 'twitter-share' }, twitterShare, social);

  // Facebook
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}&display=popup&ref=plugin&src=share_button`;
  const facebookShare = `
    <a href="${facebookUrl}"
        onclick="return !window.open(this.href, 'Facebook', 'width=640,height=580')">
        <span class="icon icon-social-facebook" />
    </a>`;
  createEl('div', { class: 'facebook-share' }, facebookShare, social);

  // Email
  const emailUrl = `mailto:?subject=${pageTitle}&body=Read this from Accenture Newsroom: ${pageUrl}`;
  const emailShare = `
    <a href="${emailUrl}"
        target="_blank">
        <span class="icon icon-social-email" />
    </a>`;
  createEl('div', { class: 'email-share' }, emailShare, social);

  // Print
  const printShare = `
    <a href="javascript:void(0)"
      onclick="window.print()">
      <span class="icon icon-social-print" />
    </a>`;
  createEl('div', { class: 'print-share' }, printShare, social);
  await decorateIcons(social);
  const share = createEl('div', { class: 'share' }, social);
  const shareTitle = createEl('h4', {}, 'Share');
  share.prepend(shareTitle);
  block.append(share);
}
