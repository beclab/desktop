import {
  Controller,
  Get,
  Param,
  Res,
  HttpStatus,
  Header,
} from '@nestjs/common';
import { statSync, createReadStream } from 'fs';
import { Headers } from '@nestjs/common';
import { Response } from 'express';
import { Encoder } from '@bytetrade/core';

@Controller('video')
export class VideoController {
  constructor() {
    //
  }

  @Get('stream/file/:id')
  @Header('Accept-Ranges', 'bytes')
  @Header('Content-Type', 'video/mp4')
  async getStreamVideo(
    @Param('id') id: string,
    @Headers() headers,
    @Res() res: Response,
  ) {
    try {
      console.log('id');
      console.log(id);
      const videoPath = Encoder.bytesToString(Encoder.base64UrlToBytes(id));
      console.log(videoPath);
      //const videoPath = `/Users/pengpeng/Downloads/TerminusV2.mp4`;
      const { size } = statSync(videoPath);
      const videoRange = headers.range;
      if (videoRange) {
        const parts = videoRange.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : size - 1;
        const chunksize = end - start + 1;
        const readStreamfile = createReadStream(videoPath, {
          start,
          end,
          highWaterMark: 60,
        });
        const head = {
          'Content-Range': `bytes ${start}-${end}/${size}`,
          'Content-Length': chunksize,
        };
        res.writeHead(HttpStatus.PARTIAL_CONTENT, head); //206
        readStreamfile.pipe(res);
      } else {
        const head = {
          'Content-Length': size,
        };
        res.writeHead(HttpStatus.OK, head); //200
        createReadStream(videoPath).pipe(res);
      }
    } catch (e) {
      console.log(e);
    }
  }
}
