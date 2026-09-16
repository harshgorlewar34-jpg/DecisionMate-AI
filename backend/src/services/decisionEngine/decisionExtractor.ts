import { DecisionOption, DecisionState, DecisionType } from '../../types/decision.js';

export class DecisionExtractor {
  /**
   * Detects the type of decision being made.
   */
  detectDecisionType(text: string, currentState?: DecisionState): DecisionType {
    const lower = text.toLowerCase();

    if (lower.includes('intern') || lower.includes('ppo') || lower.includes('stipend')) {
      return 'internship';
    }
    if (lower.includes('laptop') || lower.includes('phone') || lower.includes('buy') || lower.includes('purchase') || lower.includes('specs') || lower.includes('macbook') || lower.includes('gadget')) {
      return 'purchase';
    }
    if (lower.includes('learn') || lower.includes('python') || lower.includes('java') || lower.includes('c++') || lower.includes('study first') || lower.includes('which language')) {
      return 'learning';
    }
    if (lower.includes('college') || lower.includes('university') || lower.includes('course') || lower.includes('degree') || lower.includes('btech') || lower.includes('mba')) {
      return 'education';
    }
    if (lower.includes('job') || lower.includes('career') || lower.includes('salary') || lower.includes('offer') || lower.includes('accept') || lower.includes('promotion') || lower.includes('resignation')) {
      return 'career';
    }
    if (lower.includes('invest') || lower.includes('crypto') || lower.includes('stock') || lower.includes('mutual fund') || lower.includes('savings')) {
      return 'finance';
    }

    return currentState?.decisionType || 'other';
  }

  /**
   * Extracts candidate options from user messages.
   */
  extractOptions(text: string, existingOptions: DecisionOption[] = []): DecisionOption[] {
    const optionsMap = new Map<string, DecisionOption>();
    for (const opt of existingOptions) {
      optionsMap.set(opt.name.toLowerCase(), { ...opt });
    }

    // If message is purely stating a goal or priority and we already have options, preserve existing options
    if (existingOptions.length >= 2 && /(?:my\s+(?:main\s+)?goal\s+is|i\s+want\s+to\s+become|my\s+priority\s+is)/i.test(text)) {
      return Array.from(optionsMap.values());
    }

    // Pattern 0: Known distinct technologies or frameworks (e.g. Python vs Java, React vs Flutter)
    const techPairs: [RegExp, string, string][] = [
      [/\bpython\b/i, 'Python', 'High-level language leading in AI, Data Science, and rapid prototyping'],
      [/\bjava\b/i, 'Java', 'Statically typed language leading in enterprise backend and Android'],
      [/\bjavascript\b|\bjs\b/i, 'JavaScript', 'Universal web development language'],
      [/\bc\+\+\b/i, 'C++', 'High-performance systems language'],
      [/\breact\b/i, 'React', 'Declarative UI library for web development'],
      [/\bflutter\b/i, 'Flutter', 'Cross-platform UI toolkit']
    ];

    const foundTech = techPairs.filter(([regex]) => regex.test(text));
    if (foundTech.length >= 2) {
      for (const [, name, details] of foundTech) {
        this.upsertOption(optionsMap, name, details);
      }
      return Array.from(optionsMap.values());
    }

    // Pattern 1: Explicit labels with is/has/with/colon: Laptop A has ..., Company A is ..., Option 1: ...
    const labeledMatches = text.matchAll(/(?:Company|Option|Offer|Course|Laptop|Alternative|Choice|Model)\s+([A-Za-z0-9]+)(?:[^\n,\.;]*?)(?:[:\-–]|\s+(?:is|has|with|offers)\s+)([^\n\.\;]+)/gi);
    for (const match of labeledMatches) {
      const label = match[0].split(/[:\-–]|\s+(?:is|has|with|offers)\s+/i)[0].trim();
      const details = match[2] ? match[2].trim() : match[0];
      if (this.isValidOptionCandidate(label)) {
        this.upsertOption(optionsMap, label, details);
      }
    }

    // Pattern 2: Compare X or Y / X vs Y / X and Y
    const orMatches = text.match(/(?:between|choose|compare)?\s*([A-Za-z0-9\+\#\.\s]{2,30})\s+(?:or|vs\.?|versus|and)\s+([A-Za-z0-9\+\#\.\s]{2,30})/i);
    if (orMatches && orMatches[1] && orMatches[2] && optionsMap.size < 2) {
      const name1 = this.cleanOptionName(orMatches[1]);
      const name2 = this.cleanOptionName(orMatches[2]);
      if (this.isValidOptionCandidate(name1) && this.isValidOptionCandidate(name2)) {
        this.upsertOption(optionsMap, name1, text);
        this.upsertOption(optionsMap, name2, text);
      }
    }

    // Pattern 3: Bullet points or numbered lists: 1. ... 2. ...
    const listMatches = text.matchAll(/(?:^|\n)\s*(?:[1-9]\.|\-|\*)\s*([A-Za-z0-9\s\+\#\.\-\(\)]+?)[:\-–]\s*([^\n]+)/g);
    for (const match of listMatches) {
      const name = match[1].trim();
      const details = match[2].trim();
      if (this.isValidOptionCandidate(name)) {
        this.upsertOption(optionsMap, name, details);
      }
    }

    // Pattern 4: Inline "X is Y with Z" (excluding goal / priority keywords)
    const inlineMatches = text.matchAll(/([A-Za-z0-9\s]{2,25})\s+(?:is|has)\s+([^,;\.]+)/gi);
    for (const match of inlineMatches) {
      const name = this.cleanOptionName(match[1]);
      const details = match[2].trim();
      if (this.isValidOptionCandidate(name) && optionsMap.size < 4) {
        this.upsertOption(optionsMap, name, details);
      }
    }

    return Array.from(optionsMap.values());
  }

  /**
   * Extracts user's target goal.
   */
  extractGoal(text: string, currentGoal: string | null = null): string | null {
    // e.g. "My goal is to become an AI Engineer", "I want to do heavy AI development", "Aiming to build apps"
    const goalMatch = text.match(/(?:my\s+(?:main\s+)?goal\s+(?:is|to)|i\s+want\s+to\s+(?:become|do|build|focus\s+on|work\s+on|use\s+for)|i\s+aim\s+to|target\s+is\s+(?:to)?|objective\s+is\s+(?:to)?|primarily\s+(?:for|to))\s+([^,\.\n]+)/i);
    if (goalMatch && goalMatch[1]) {
      return goalMatch[1].trim();
    }
    return currentGoal;
  }

  /**
   * Extracts user priorities.
   */
  extractPriorities(text: string, currentPriorities: string[] = []): string[] {
    const priorities = new Set<string>(currentPriorities.map(p => p.toLowerCase()));
    const lower = text.toLowerCase();

    const priorityKeywords: Record<string, string[]> = {
      'salary': ['salary', 'money', 'stipend', 'pay', 'compensation', 'package', 'ctc'],
      'learning': ['learning', 'learn', 'knowledge', 'skill', 'skills', 'hands-on', 'practical'],
      'career relevance': ['career relevance', 'career growth', 'future growth', 'ai engineer', 'long term', 'growth'],
      'real project': ['real project', 'production', 'live project', 'actual work'],
      'mentorship': ['mentor', 'mentorship', 'guidance', 'senior'],
      'work-life balance': ['work life balance', 'wlb', 'culture', 'hours', 'flexibility', 'stress'],
      'stability': ['stability', 'secure', 'safe', 'stable', 'layoff'],
      'price/budget': ['budget', 'price', 'cost', 'cheaper', 'affordable'],
      'performance': ['performance', 'speed', 'fast', 'cpu', 'gpu', 'gaming', 'fps'],
      'location': ['location', 'remote', 'work from home', 'commute', 'city']
    };

    for (const [key, terms] of Object.entries(priorityKeywords)) {
      if (terms.some(t => lower.includes(t))) {
        // If user says "priority is X" or "matters most is X" or explicitly talks about it
        if (
          lower.includes('priority') ||
          lower.includes('matter') ||
          lower.includes('prefer') ||
          lower.includes('care most') ||
          lower.includes('important') ||
          terms.some(t => lower.includes(`my ${t}`) || lower.includes(`${t} is`))
        ) {
          priorities.add(key);
        }
      }
    }

    return Array.from(priorities);
  }

  /**
   * Extracts constraints (e.g., budget under ₹60,000, 3 months duration).
   */
  extractConstraints(text: string, currentConstraints: string[] = []): string[] {
    const constraints = new Set<string>(currentConstraints);

    const budgetMatch = text.match(/(?:budget|under|less than|max)\s*(?:of)?\s*([₹$€£]?\s*\d+[kKmM0-9,\.]*)/i);
    if (budgetMatch && budgetMatch[1]) {
      constraints.add(`Budget: ${budgetMatch[1].trim()}`);
    }

    const durationMatch = text.match(/(?:duration|time|within)\s*(?:of)?\s*(\d+\s*(?:months?|weeks?|years?|days?))/i);
    if (durationMatch && durationMatch[1]) {
      constraints.add(`Duration: ${durationMatch[1].trim()}`);
    }

    return Array.from(constraints);
  }

  /**
   * Helper to clean up option name.
   */
  private cleanOptionName(str: string): string {
    return str
      .replace(/^(should\s+i\s+(?:learn|choose|buy|take|pick|opt\s+for|study)|is\s+it\s+better\s+to\s+(?:choose|buy|take|learn)|between|compare)\s+/i, '')
      .replace(/\s+(?:first|now|instead|today|for\s+me)$/i, '')
      .replace(/[,\.\?!]/g, '')
      .trim();
  }

  private isValidOptionCandidate(str: string): boolean {
    if (!str || str.length < 2 || str.length > 50) return false;
    const lower = str.toLowerCase().trim();
    const exactBanned = [
      'which', 'what', 'how', 'why', 'should i', 'the dilemma', 'internship', 'laptop', 
      'option', 'course', 'choice', 'offer', 'alternative', 'decision'
    ];
    if (exactBanned.includes(lower)) return false;

    const prefixBanned = [
      'my goal', 'my main goal', 'my priority', 'my target',
      'my objective', 'become an', 'i want to', 'target is', 'goal is',
      'should i', 'which is'
    ];
    return !prefixBanned.some(p => lower.startsWith(p));
  }

  private upsertOption(map: Map<string, DecisionOption>, name: string, details: string): void {
    const key = name.toLowerCase();
    const existing = map.get(key) || {
      id: `opt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name,
      attributes: {}
    };

    // Extract attributes from details
    if (details) {
      existing.rawDetails = existing.rawDetails ? `${existing.rawDetails}; ${details}` : details;

      // Role
      const roleMatch = details.match(/(?:role|position|as an?)\s*[:\-–]?\s*([A-Za-z0-9\/\s\-\+]+?)(?:,|\.|$|with|stipend)/i);
      if (roleMatch && roleMatch[1]) {
        existing.role = roleMatch[1].trim();
      } else if (details.toLowerCase().includes('intern')) {
        existing.role = details.split(/[,;\.]/)[0].trim();
      }

      // Stipend / Salary
      const moneyMatch = details.match(/([₹$€£]\s*[\d,kKmM]+|\d+\s*(?:k|lpa|thousand|per month|pm|\/mo))/i);
      if (moneyMatch && moneyMatch[1]) {
        existing.stipend = moneyMatch[1].trim();
        existing.salary = moneyMatch[1].trim();
      }

      // Duration
      const durationMatch = details.match(/(\d+\s*(?:months?|weeks?|years?))/i);
      if (durationMatch && durationMatch[1]) {
        existing.duration = durationMatch[1].trim();
      }

      // Technologies
      const techList: string[] = [];
      const knownTech = ['python', 'machine learning', 'ai', 'data science', 'react', 'node.js', 'javascript', 'typescript', 'java', 'spring', 'c\\+\\+', 'aws', 'docker', 'sql'];
      for (const tech of knownTech) {
        if (new RegExp(`\\b${tech}\\b`, 'i').test(details)) {
          const cleanName = tech.replace(/\\/g, '');
          techList.push(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
        }
      }
      if (techList.length > 0) {
        existing.technology = Array.from(new Set([...(existing.technology || []), ...techList]));
      }

      // Specs for products/laptops
      const specs: Record<string, string> = existing.specs || {};
      const ramMatch = details.match(/(\d+GB\s*(?:RAM|Unified))/i);
      if (ramMatch) specs['RAM'] = ramMatch[1];
      const ssdMatch = details.match(/(\d+(?:GB|TB)\s*(?:SSD|Storage))/i);
      if (ssdMatch) specs['Storage'] = ssdMatch[1];
      const cpuMatch = details.match(/(i[3579][\-\s]\d+\w*|ryzen\s*\d+\w*|m[1234]\s*(?:pro|max)?)/i);
      if (cpuMatch) specs['CPU'] = cpuMatch[1];
      const gpuMatch = details.match(/(rtx\s*\d{4}|gtx\s*\d{4}|radeon\s*\w+)/i);
      if (gpuMatch) specs['GPU'] = gpuMatch[1];
      existing.specs = specs;
    }

    map.set(key, existing);
  }
}

export const decisionExtractor = new DecisionExtractor();
