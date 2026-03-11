import { describe, it, expect, beforeEach } from 'vitest';
import {
  deepLinkToHttps,
  setDeepLinkClickHandler,
  getDeepLinkClickHandler,
  type DeepLinkClickHandler,
} from '../../../src/utils/deepLinkHandler';

describe('deepLinkToHttps', () => {
  it('converts unicity-connect:// to https://', () => {
    expect(deepLinkToHttps('unicity-connect://example.com/path')).toBe('https://example.com/path');
  });

  it('preserves query parameters and hash', () => {
    expect(deepLinkToHttps('unicity-connect://example.com/app?game=abc&action=ch#section')).toBe(
      'https://example.com/app?game=abc&action=ch#section',
    );
  });

  it('preserves port numbers', () => {
    expect(deepLinkToHttps('unicity-connect://localhost:5173/chess')).toBe(
      'https://localhost:5173/chess',
    );
  });

  it('leaves non-matching inputs unchanged', () => {
    expect(deepLinkToHttps('https://example.com')).toBe('https://example.com');
    expect(deepLinkToHttps('http://example.com')).toBe('http://example.com');
    expect(deepLinkToHttps('plain text')).toBe('plain text');
    expect(deepLinkToHttps('')).toBe('');
  });

  it('only replaces the prefix, not occurrences elsewhere', () => {
    expect(
      deepLinkToHttps('unicity-connect://example.com/?ref=unicity-connect://other'),
    ).toBe('https://example.com/?ref=unicity-connect://other');
  });
});

describe('deepLinkClickHandler registry', () => {
  beforeEach(() => {
    setDeepLinkClickHandler(null);
  });

  it('returns null when no handler is registered', () => {
    expect(getDeepLinkClickHandler()).toBeNull();
  });

  it('stores and retrieves a handler', () => {
    const handler: DeepLinkClickHandler = () => {};
    setDeepLinkClickHandler(handler);
    expect(getDeepLinkClickHandler()).toBe(handler);
  });

  it('clears handler when set to null', () => {
    setDeepLinkClickHandler(() => {});
    setDeepLinkClickHandler(null);
    expect(getDeepLinkClickHandler()).toBeNull();
  });

  it('replaces a previously registered handler', () => {
    const first: DeepLinkClickHandler = () => {};
    const second: DeepLinkClickHandler = () => {};
    setDeepLinkClickHandler(first);
    setDeepLinkClickHandler(second);
    expect(getDeepLinkClickHandler()).toBe(second);
  });
});
