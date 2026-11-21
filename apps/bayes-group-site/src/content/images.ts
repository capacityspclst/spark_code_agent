export type PhotoName =
  | 'hero-boardroom'
  | 'smb-owner'
  | 'team-workshop'
  | 'enterprise-atrium'
  | 'custom-development'
  | 'strategy-session'
  | 'about-office'
  | 'contact-meeting';

export const PHOTOS: Record<PhotoName, { alt: string }> = {
  'hero-boardroom': {
    alt: 'Meeting room with a wall screen showing data visualizations',
  },
  'smb-owner': {
    alt: 'Small business owner reviewing data on a laptop',
  },
  'team-workshop': {
    alt: 'Team in a workshop setting discussing AI concepts',
  },
  'enterprise-atrium': {
    alt: 'Large atrium with modern design, representing enterprise scale',
  },
  'custom-development': {
    alt: 'Developers coding custom AI solutions on screens',
  },
  'strategy-session': {
    alt: 'Strategy session with charts and diagrams on a whiteboard',
  },
  'about-office': {
    alt: 'Office interior with collaborative workspace',
  },
  'contact-meeting': {
    alt: 'Meeting with a consultant discussing project details',
  },
};
