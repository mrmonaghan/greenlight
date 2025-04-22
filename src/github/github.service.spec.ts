import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { GithubService } from './github.service';

describe('GithubService', () => {
  let service: GithubService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GithubService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const mockConfig = {
                name: 'greenlight',
                'status.ignore': [],
                'status.require': [],
                'status.strict': false,
                'branch.include': [],
                'branch.ignore': [],
              };
              return mockConfig[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<GithubService>(GithubService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should initialize with default values', () => {
    expect(service['name']).toBe('greenlight');
    expect(service['ignores']).toContain('greenlight');
    expect(service['requires']).toEqual([]);
    expect(service['strictStatuses']).toBe(false);
    expect(service['includeBranchPatterns']).toEqual([]);
    expect(service['ignoreBranchPatterns']).toEqual([]);
  });

  describe('branchIsValid', () => {
    it('should return false if branch matches ignore patterns', () => {
      service['ignoreBranchPatterns'] = ['feature/*'];
      expect(service.branchIsValid('feature/test')).toBe(false);
    });

    it('should return true if branch matches include patterns', () => {
      service['includeBranchPatterns'] = ['main', 'release/*'];
      expect(service.branchIsValid('release/v1.0')).toBe(true);
    });

    it('should return true if no include patterns are defined', () => {
      service['includeBranchPatterns'] = [];
      expect(service.branchIsValid('any-branch')).toBe(true);
    });
  });

  describe('handlePingEvent', () => {
    it('should log the received ping event', () => {
      const loggerSpy = jest.spyOn(service['logger'], 'log');
      service.handlePingEvent({ id: '123', name: 'ping' });
      expect(loggerSpy).toHaveBeenCalledWith('Received ping event: ping with id: 123');
    });
  });

  describe('markdownTitle', () => {
    it('should return the correct title for failure state', () => {
      expect(service.markdownTitle('failure')).toBe('## :red_circle: Greenlight - PR Mergeability');
    });

    it('should return the correct title for pending state', () => {
      expect(service.markdownTitle('pending')).toBe('## :yellow_circle: Greenlight - PR Mergeability');
    });

    it('should return the correct title for success state', () => {
      expect(service.markdownTitle('success')).toBe('## :green_circle: Greenlight - PR Mergeability');
    });
  });

  describe('markdownFooter', () => {
    it('should return the correct footer for status event', () => {
      expect(service.markdownFooter('status', '123')).toBe('---\n<sub>Triggered by webhook event ID 123</sub>');
    });

    it('should return the correct footer for issue_comment event', () => {
      expect(service.markdownFooter('issue_comment', 'http://example.com')).toBe(
        '---\n<sub>Refreshed by [this comment](http://example.com)</sub>',
      );
    });
  });
});
