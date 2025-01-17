import { cleanUp, parse } from './index';

describe('query cleanUp', () => {
  it('returns empty string for empty inputs', () => {
    expect(cleanUp('')).toEqual('');
    expect(cleanUp()).toEqual('');
    expect(cleanUp(null)).toEqual('');
    expect(cleanUp(<any>false)).toEqual('');
  });

  it('removes line breaks from simple select query', () => {
    const query = `
select
  *
from
  table
    `;
    expect(cleanUp(query)).toEqual('select * from table');
  });

  it('removes comments from queries', () => {
    const query = `
select
  * -- here is a comment
  /**
   * multiline comment
   */
from
  table
    `;
    expect(cleanUp(query)).toEqual('select * from table');
  });

  it('don`t change inline queries', () => {
    const query = `udpate tablename set value = 2, value2 = 'string' where id = 1`;
    expect(cleanUp(query)).toEqual(query);
  });
});

describe('query parse', () => {
  it('parses single query string to array', () => {
    const query = `select
  * -- here is a comment
  /**
   * multiline comment
   */
from
  table`;
    expect(parse(query)).toEqual([query]);
    expect(parse(query, 'mysql')).toEqual([query]);
    expect(parse(query, 'pg')).toEqual([query]);
    const mssqlQuery = `${query};
GO`;
    expect(parse(mssqlQuery, 'mssql')).toEqual([`${query};`]);
  });

  it('parses muliple query string to array of queries', () => {
    const query = `select
  *
from
  table;`;
    expect(parse(`${query}\n${query}`)).toEqual([query, query]);
    expect(parse(`${query}\n${query}`, 'mysql')).toEqual([query, query]);
    expect(parse(`${query}\n${query}`, 'pg')).toEqual([query, query]);
    expect(parse(`${query}\n${query}`, 'mssql')).toEqual([query, query]);
    const mssqlQuery = `${query}
GO

${query}
GO`;
    expect(parse(mssqlQuery, 'mssql')).toEqual([query, query]);
  });
});
