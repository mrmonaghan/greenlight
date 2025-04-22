import { Controller, Post, Req, Res, Logger } from '@nestjs/common';
import { GithubService } from './github.service';
import { Request, Response } from 'express';

@Controller('github')
export class GithubController {
    private logger = new Logger("github-controller");

    constructor(private githubService: GithubService) {}

    @Post('webhook')
    async webhook(@Req() request: Request, @Res() response: Response) {
        try {
            const headers = {
                'x-github-event': request.headers['x-github-event'],
                'x-hub-signature-256': request.headers['x-hub-signature-256'],
                'x-github-delivery': request.headers['x-github-delivery'],
            };

            await this.githubService.handleWebhookEvent(request.body, headers);
            response.status(200).send('Webhook processed successfully');
        } catch (error) {
            this.logger.error(`Error processing webhook: ${error.message}`);
            response.status(400).send('Webhook verification failed');
        }
    }
}
