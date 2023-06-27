import type { Request, Response, NextFunction } from 'express';

export interface HandlerContext {
  req: Request;
  res: Response;
  next: NextFunction;
}

// @todo перенести в пресеты?
export interface PageAssets {
  js: string;
  css: string;
  criticalJs?: string;
  criticalCss?: string;
}

// @todo перенести в пресеты
export interface ConventionalJson {
  markup: string;
  bundle_js: string;
  bundle_css: string;
  critical_js?: string;
  critical_css?: string;
  meta?: any;
}
