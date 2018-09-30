export class Utils {
  public static bundleMinimalObject(o: any) {
    const no = {};

    for (const p in o) {
      if (o.hasOwnProperty(p)) {
        const nt = o[p];
        if (nt) {
          if (nt && nt instanceof String) {
            if (nt.length > 0) no[p] = nt;
          } else if (Array.isArray(nt)) {
            if (nt.length > 0) no[p] = nt;
          } else {
            no[p] = nt;
          }
        }
      }
    }

    return no;
  }
}
