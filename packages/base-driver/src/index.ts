import { createLogger } from '@sqltools/log';
import {
  ContextValue,
  IBaseQueries,
  IConnection,
  IConnectionDriver,
  IExpectedResult,
  IQueryOptions,
  LSIConnection,
  MConnectionExplorer,
  NodeDependency,
  NSDatabase,
} from '@sqltools/types';
import fs from 'fs';
import path from 'path';
import ElectronNotSupportedError from './lib/exception/electron-not-supported';
import MissingModuleError from './lib/exception/missing-module';
import sqltoolsRequire, { sqltoolsResolve } from './lib/require';

export default abstract class AbstractDriver<ConnectionType extends any, DriverOptions extends any>
  implements IConnectionDriver {
  public log: ReturnType<typeof createLogger>;
  public readonly deps: NodeDependency[] = [];

  public getId() {
    return this.credentials.id;
  }
  public connection: Promise<ConnectionType>;
  abstract queries: IBaseQueries;
  constructor(
    public credentials: IConnection<DriverOptions>,
    protected getWorkspaceFolders: LSIConnection['workspace']['getWorkspaceFolders']
  ) {
    this.log = createLogger(credentials.driver.toLowerCase());
  }

  abstract open(): Promise<ConnectionType>;
  abstract close(): Promise<void>;

  abstract query<R = any, Q = any>(
    queryOrQueries: Q | string | string,
    opt: IQueryOptions
  ): Promise<NSDatabase.IResult<Q extends IExpectedResult<infer U> ? U : R>[]>;

  public singleQuery<R = any, Q = any>(query: Q | string | string, opt: IQueryOptions) {
    return this.query<R, Q>(query, opt).then(([res]) => res);
  }

  protected queryResults = async <R = any, Q = any>(query: Q | string | string, opt?: IQueryOptions) => {
    const result = await this.singleQuery<R, Q>(query, opt);
    if (result.error) throw result.rawError;
    return result.results;
  };

  public async describeTable(metadata: NSDatabase.ITable, opt: IQueryOptions) {
    const result = await this.singleQuery(this.queries.describeTable(metadata), opt);
    result.baseQuery = this.queries.describeTable.raw;
    return [result];
  }

  public async showRecords(table: NSDatabase.ITable, opt: IQueryOptions & { limit: number; page?: number }) {
    const { limit, page = 0 } = opt;
    const params = { ...opt, limit, table, offset: page * limit };
    if (typeof this.queries.fetchRecords === 'function' && typeof this.queries.countRecords === 'function') {
      const [records, totalResult] = await Promise.all([
        this.singleQuery(this.queries.fetchRecords(params), opt),
        this.singleQuery(this.queries.countRecords(params), opt),
      ]);
      records.baseQuery = this.queries.fetchRecords.raw;
      records.pageSize = limit;
      records.page = page;
      records.total = Number((totalResult.results[0] as any).total);
      records.queryType = 'showRecords';
      records.queryParams = table;
      return [records];
    }

    return this.query(this.queries.fetchRecords(params), opt);
  }

  public async checkDependencies() {
    if (!this.deps || this.deps.length === 0) return;
    if (Number(process.env.IS_NODE_RUNTIME || '0') !== 1) {
      throw new ElectronNotSupportedError();
    }
    this.deps.forEach(dep => {
      let mustUpgrade = false;
      switch (dep.type) {
        case AbstractDriver.CONSTANTS.DEPENDENCY_PACKAGE:
          try {
            const { version } = JSON.parse(fs.readFileSync(this.resolveDep(dep.name + '/package.json')).toString());
            if (dep.version && version !== dep.version) {
              mustUpgrade = true;
              throw new Error(`Version not matching. We need to upgrade ${dep.name}`);
            }
            this.requireDep(dep.name);
          } catch (e) {
            throw new MissingModuleError(this.deps, this.credentials, mustUpgrade);
          }
          break;
      }
    });
  }

  public requireDep = (name: string) => {
    return sqltoolsRequire(name);
  };

  public resolveDep = (name: string) => {
    return sqltoolsResolve(name);
  };

  public getChildrenForItem(_params: {
    item: NSDatabase.SearchableItem;
    parent?: NSDatabase.SearchableItem;
  }): Promise<MConnectionExplorer.IChildItem[]> {
    this.log.error(
      `###### Attention ######\ngetChildrenForItem not implemented for ${this.credentials.driver}\n####################`
    );
    return Promise.resolve([]);
  }
  public searchItems(
    _itemType: ContextValue,
    _search: string,
    _extraParams?: unknown
  ): Promise<NSDatabase.SearchableItem[]> {
    this.log.error(
      `###### Attention ######\nsearchItems not implemented for ${this.credentials.driver}\n####################`
    );
    return Promise.resolve([]);
  }

  public async toAbsolutePath(fsPath: string) {
    if (!path.isAbsolute(fsPath) && /\$\{workspaceFolder:(.+)}/g.test(fsPath)) {
      const workspaceName = fsPath.match(/\$\{workspaceFolder:(.+)}/)[1];
      if (workspaceName) {
        const workspaceFolders = await this.getWorkspaceFolders();
        const dbWorkspace = workspaceFolders.find(w => w.name === workspaceName);
        fsPath = path.resolve(
          dbWorkspace.uri.replace(/^(\w+):\/\//, ''),
          fsPath.replace(/\$\{workspaceFolder:(.+)}/g, './')
        );
      }
    }
    return fsPath;
  }

  protected prepareMessage(message: unknown): NSDatabase.IResult['messages'][number] {
    return { message: `${message}`, date: new Date() };
  }

  static readonly CONSTANTS = {
    DEPENDENCY_PACKAGE: 'package' as NodeDependency['type'],
    DEPENDENCY_NPM_SCRIPT: 'npmscript' as NodeDependency['type'],
  };
}
