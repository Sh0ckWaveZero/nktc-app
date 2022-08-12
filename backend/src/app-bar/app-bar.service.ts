import { Injectable } from '@nestjs/common';
import { SearchData } from './db';
import { CreateAppBarDto } from './dto/create-app-bar.dto';
import { UpdateAppBarDto } from './dto/update-app-bar.dto';
import { AppBarSearchType } from './types';

@Injectable()
export class AppBarService {

  search(q: string = ''): AppBarSearchType[] {
    const queryLowered = q.toLowerCase();
    const searchData: AppBarSearchType[] = SearchData;

    const exactData: { [k: string]: AppBarSearchType[] } = {
      dashboards: [],
      appsPages: [],
      userInterface: [],
      formsTables: [],
      chartsMisc: []
    }

    const includeData: { [k: string]: AppBarSearchType[] } = {
      dashboards: [],
      appsPages: [],
      userInterface: [],
      formsTables: [],
      chartsMisc: []
    }

    searchData.forEach(obj => {
      const isMatched = obj.title.toLowerCase().startsWith(queryLowered)
      if (isMatched && exactData[obj.category].length < 5) {
        exactData[obj.category].push(obj)
      }
    })

    searchData.forEach(obj => {
      const isMatched =
        !obj.title.toLowerCase().startsWith(queryLowered) && obj.title.toLowerCase().includes(queryLowered)
      if (isMatched && includeData[obj.category].length < 5) {
        includeData[obj.category].push(obj)
      }
    })

    const categoriesCheck: string[] = []

    Object.keys(exactData).forEach(category => {
      if (exactData[category].length > 0) {
        categoriesCheck.push(category)
      }
    })

    const resultsLength = categoriesCheck.length === 1 ? 5 : 3

    return [
      ...exactData.dashboards.concat(includeData.dashboards).slice(0, resultsLength),
      ...exactData.appsPages.concat(includeData.appsPages).slice(0, resultsLength),
      ...exactData.userInterface.concat(includeData.userInterface).slice(0, resultsLength),
      ...exactData.formsTables.concat(includeData.formsTables).slice(0, resultsLength),
      ...exactData.chartsMisc.concat(includeData.chartsMisc).slice(0, resultsLength)
    ]
  }
}
