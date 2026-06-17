'use client'

import './RichTextRenderer.css'
import React from 'react'
import { getYoutubeId, isYoutubeUrl } from '@/lib/youtube'
import YouTubeVideoPlayer from '../YouTubeVideoPlayer/YouTubeVideoPlayer'

function renderYoutubeEmbed(url: string, key: number) {
  const videoId = getYoutubeId(url)
  if (!videoId) return null

  return (
    <div key={key} className="inline-video-embed">
      <YouTubeVideoPlayer
        videoId={videoId}
        videoUrl={url}
        variant="auto"
      />
    </div>
  )
}

function renderNode(node: any, key: number): React.ReactNode {
  if (!node) return null

  const children = node.children?.map((child: any, i: number) => renderNode(child, i)) ?? []

  switch (node.type) {
    case 'root':
      return <>{children}</>
    case 'paragraph': {
      if (node.children?.length === 1) {
        const only = node.children[0]
        if (only.type === 'link' && isYoutubeUrl(only.url || '')) {
          return renderYoutubeEmbed(only.url, key)
        }
        if (only.type === 'autolink' && isYoutubeUrl(only.url || only.fields?.url || '')) {
          return renderYoutubeEmbed(only.url || only.fields?.url, key)
        }
        if (only.type === 'text' && isYoutubeUrl(String(only.text || '').trim())) {
          return renderYoutubeEmbed(String(only.text).trim(), key)
        }
      }

      if (!children.length || children.every((c: any) => c === null || c === '')) return null
      return <p key={key}>{children}</p>
    }
    case 'heading': {
      const level = node.tag || 'h2'
      const Tag = level as React.ElementType
      return <Tag key={key}>{children}</Tag>
    }
    case 'list': {
      const Tag = node.listType === 'number' ? 'ol' : 'ul'
      return <Tag key={key}>{children}</Tag>
    }
    case 'listitem':
      return <li key={key}>{children}</li>
    case 'quote':
      return <blockquote key={key}>{children}</blockquote>
    case 'link':
    case 'autolink': {
      const url = node.url || node.fields?.url || '#'
      if (isYoutubeUrl(url)) {
        return renderYoutubeEmbed(url, key)
      }
      return (
        <a key={key} href={url} target="_blank" rel="noopener noreferrer">
          {children.length ? children : url}
        </a>
      )
    }
    case 'text': {
      let content: React.ReactNode = node.text
      if (!content) return null
      if (node.format & 1) content = <strong>{content}</strong>
      if (node.format & 2) content = <em>{content}</em>
      if (node.format & 8) content = <u>{content}</u>
      if (node.format & 16) content = <s>{content}</s>
      if (node.format & 32)
        content = (
          <code
            style={{
              background: 'var(--bg2)',
              padding: '2px 6px',
              borderRadius: 4,
              fontSize: '0.9em',
            }}
          >
            {content}
          </code>
        )
      return <React.Fragment key={key}>{content}</React.Fragment>
    }
    case 'linebreak':
      return <br key={key} />
    case 'horizontalrule':
      return (
        <hr key={key} style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '24px 0' }} />
      )
    default:
      if (children.length) return <div key={key}>{children}</div>
      return null
  }
}

export default function RichTextRenderer({ content }: { content: any }) {
  if (!content?.root) return null
  return <div className="article-body">{renderNode(content.root, 0)}</div>
}
