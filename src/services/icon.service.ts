import { Injectable } from '@angular/core';

// In a real application with a build system that supports JSON imports, this would be:
// import ICON_MAPPING from '../../config/ICON_MAPPING.json';
const ICON_MAPPING: Record<string, string> = {
  "InfluencerDiscovery": "search",
  "CampaignManagement": "trello",
  "Conversations": "message-square",
  "PerformanceAnalytics": "bar-chart-2",
  "Settings": "settings",
  "Add": "plus-circle",
  "Link": "link-2",
  "User": "user",
  "Filter": "filter",
  "AlertTriangle": "alert-triangle",
  "ChevronDown": "chevron-down",
  "Delete": "trash-2",
  "ExternalLink": "external-link",
  "Insights": "zap",
  "Menu": "menu",
  "Logout": "log-out",
  "ArrowLeft": "arrow-left",
  "Database": "database",
  "Users": "users",
  "Compose": "edit-2",
  "Close": "x",
  "Minimize": "minus",
  "Maximize": "maximize-2",
  "Bold": "bold",
  "Italic": "italic",
  "Underline": "underline",
  "List": "list",
  "Paperclip": "paperclip",
  "Wand": "wand",
  "Building": "building",
  "Inbox": "inbox",
  "Back": "arrow-left-circle",
  "Send": "send",
  "Calendar": "calendar"
};


@Injectable({ providedIn: 'root' })
export class IconService {

  private iconMap = new Map<string, string>([
    ['search', `<circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>`],
    ['trello', `<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><rect x="7" y="7" width="3" height="9"></rect><rect x="14" y="7" width="3" height="5"></rect>`],
    ['message-square', `<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>`],
    ['bar-chart-2', `<line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line>`],
    ['settings', `<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>`],
    ['plus-circle', `<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line>`],
    ['link-2', `<path d="M15 7h3a5 5 0 0 1 5 5 5 5 0 0 1-5 5h-3m-6 0H6a5 5 0 0 1-5-5 5 5 0 0 1 5-5h3"></path><line x1="8" y1="12" x2="16" y2="12"></line>`],
    ['user', `<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>`],
    ['filter', `<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>`],
    ['alert-triangle', `<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>`],
    ['chevron-down', `<polyline points="6 9 12 15 18 9"></polyline>`],
    ['trash-2', `<polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line>`],
    ['external-link', `<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line>`],
    ['zap', `<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>`],
    ['menu', `<line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line>`],
    ['log-out', `<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line>`],
    ['arrow-left', `<line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline>`],
    ['database', `<ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>`],
    ['users', `<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>`],
    ['edit-2', `<path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>`],
    ['x', `<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>`],
    ['minus', `<line x1="5" y1="12" x2="19" y2="12"></line>`],
    ['maximize-2', `<polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line>`],
    ['bold', `<path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>`],
    ['italic', `<line x1="19" y1="4" x2="10" y2="4"></line><line x1="14" y1="20" x2="5" y2="20"></line><line x1="15" y1="4" x2="9" y2="20"></line>`],
    ['underline', `<path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"></path><line x1="4" y1="21" x2="20" y2="21"></line>`],
    ['list', `<line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line>`],
    ['paperclip', `<path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>`],
    ['wand', `<path d="M15.3 11.3a1.5 1.5 0 00-2.1 0l-4.2 4.2a1.5 1.5 0 000 2.1l4.2 4.2a1.5 1.5 0 002.1 0l4.2-4.2a1.5 1.5 0 000-2.1l-4.2-4.2z"></path><path d="M4.8 16.8l-1.5 1.5a1.5 1.5 0 000 2.1l4.2 4.2a1.5 1.5 0 002.1 0l1.5-1.5"></path><path d="M18 2.2l-5.4 5.4"></path><path d="M21.8 6l-5.4 5.4"></path><path d="M6 18l-1.5 1.5a1.5 1.5 0 000 2.1l.9.9a1.5 1.5 0 002.1 0l1.5-1.5"></path><path d="M16.8 4.8l1.5-1.5a1.5 1.5 0 00-2.1-2.1L12 5.4"></path>`],
    ['building', `<rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><path d="M9 22V4h6v18M12 22V4M15 22V4M4 12H2M22 12h-2M12 4V2M12 22v-2"></path>`],
    ['inbox', `<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>`],
    ['arrow-left-circle', `<circle cx="12" cy="12" r="10"></circle><polyline points="12 8 8 12 12 16"></polyline><line x1="16" y1="12" x2="8" y2="12"></line>`],
    ['send', `<line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>`],
    ['calendar', `<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>`]
  ]);

  getIconSvg(featureName: string): string {
    const iconName = ICON_MAPPING[featureName] || 'alert-triangle';
    return this.iconMap.get(iconName) || this.iconMap.get('alert-triangle')!;
  }
}