import { describe, it, expect } from 'vitest';
import { decisionExtractor } from '../src/services/decisionEngine/decisionExtractor.js';
import { missingInfoChecker } from '../src/services/decisionEngine/missingInfoChecker.js';
import { comparisonAnalyzer } from '../src/services/decisionEngine/comparisonAnalyzer.js';
import { responseFormatter } from '../src/services/decisionEngine/responseFormatter.js';
import { heuristicProvider } from '../src/services/ai/heuristicProvider.js';
import { stateManager } from '../src/services/memory/stateManager.js';

describe('DecisionMate AI Engine Tests', () => {
  it('Test 1 - Missing Options: detects missing options when asked "Which internship should I choose?"', async () => {
    const convId = 'test_conv_1';
    const state = stateManager.createInitialState(convId);

    const response = await heuristicProvider.processTurn('Which internship should I choose?', state);

    // Must NOT immediately recommend an option
    expect(state.options.length).toBe(0);
    expect(state.stage).toBe('clarifying');
    expect(response.reply).toMatch(/options|company/i);
    expect(response.structuredAnalysis).toBeUndefined();
  });

  it('Test 2 - Internship Recommendation: Company A (AI, 10k) vs Company B (Web, 20k) with Goal "Become an AI Engineer"', async () => {
    const convId = 'test_conv_2';
    const state = stateManager.createInitialState(convId);

    // Turn 1: Options provided
    await heuristicProvider.processTurn(
      'Company A is AI/ML Intern with ₹10,000 stipend. Company B is Web Developer Intern with ₹20,000 stipend.',
      state
    );
    expect(state.options.length).toBe(2);

    // Turn 2: Goal provided
    const response2 = await heuristicProvider.processTurn(
      'My main goal is to become an AI Engineer.',
      state
    );

    expect(state.goal).toMatch(/ai engineer/i);
    expect(state.stage).toBe('recommended');
    expect(response2.structuredAnalysis).toBeDefined();

    // Must recommend Company A because it directly matches AI Engineer goal
    expect(response2.structuredAnalysis?.recommendedOption).toBe('Company A');
    expect(response2.reply).toContain('### Recommendation');
    expect(response2.reply).toContain('Company A');
    expect(response2.reply).toContain('### Main Trade-off');
    expect(response2.reply).toContain('### Confidence');
  });

  it('Test 3 - Laptop Purchase: detects purchase dilemma and specs', async () => {
    const type = decisionExtractor.detectDecisionType('Should I buy Laptop A or Laptop B for AI and coding?');
    expect(type).toBe('purchase');

    const convId = 'test_conv_3';
    const state = stateManager.createInitialState(convId);
    state.decisionType = 'purchase';

    const response = await heuristicProvider.processTurn(
      'Laptop A has RTX 4060 and 16GB RAM for ₹75,000. Laptop B has Intel Iris XE and 8GB RAM for ₹45,000. I want to do heavy AI development.',
      state
    );

    expect(state.options.length).toBe(2);
    expect(response.structuredAnalysis?.recommendedOption).toBe('Laptop A');
    expect(response.reply).toContain('Laptop A');
  });

  it('Test 4 - Learning Dilemma: Python vs Java', async () => {
    const type = decisionExtractor.detectDecisionType('Should I learn Python or Java first?');
    expect(type).toBe('learning');

    const convId = 'test_conv_4';
    const state = stateManager.createInitialState(convId);
    state.decisionType = 'learning';

    await heuristicProvider.processTurn('Should I learn Python or Java first?', state);
    expect(state.options.map(o => o.name)).toContain('Python');
    expect(state.options.map(o => o.name)).toContain('Java');

    const finalResponse = await heuristicProvider.processTurn(
      'My goal is data science and machine learning.',
      state
    );

    expect(finalResponse.structuredAnalysis?.recommendedOption).toBe('Python');
  });

  it('Test 5 - Section 13 Output Format Conformance', () => {
    const dummyState = stateManager.createInitialState('test_format');
    dummyState.decisionType = 'internship';
    dummyState.goal = 'Become an AI Engineer';
    dummyState.options = [
      { id: '1', name: 'Alpha AI', role: 'AI Intern', stipend: '₹15,000', attributes: {} },
      { id: '2', name: 'Beta Web', role: 'Frontend Intern', stipend: '₹25,000', attributes: {} }
    ];

    const analysis = comparisonAnalyzer.analyze(dummyState);
    const formatted = responseFormatter.formatRecommendation(analysis);

    expect(formatted).toContain('### Recommendation');
    expect(formatted).toContain('### Why');
    expect(formatted).toContain('### Comparison');
    expect(formatted).toContain('### Main Trade-off');
    expect(formatted).toContain('### Risks / Missing Information');
    expect(formatted).toContain('### Next Step');
    expect(formatted).toContain('### Confidence');
  });
});
