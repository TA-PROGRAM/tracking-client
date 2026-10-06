// Shared UI kit for the tracking screens (PrimeReact + Tailwind)
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { MultiSelect } from "primereact/multiselect";
import { Calendar } from "primereact/calendar";
import { Checkbox } from "primereact/checkbox";
import { RadioButton } from "primereact/radiobutton";
import { Button } from "primereact/button";
import { Menu } from "primereact/menu";
import { Editor } from "primereact/editor";
import { FilterMatchMode } from "primereact/api";
import Swal from "sweetalert2";
import db, { fileToMock } from "../../mock/db";
import { money, thDate, toDate, isoDate } from "../../utils/format";

// ---------------------------------------------------------------- data hooks
export const useTable = (name, where, deps = []) => {
  const [state, setState] = useState({ loading: true, data: [] });
  const key = JSON.stringify(where || {});
  const reload = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    const res = await db.list(name, where);
    setState({ loading: false, data: res.data || [] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, key, ...deps]);
  useEffect(() => {
    reload();
  }, [reload]);
  return { ...state, reload, setData: (data) => setState((s) => ({ ...s, data })) };
};

export const useRecord = (name, id) => {
  const [state, setState] = useState({ loading: !!id, data: null });
  const reload = useCallback(async () => {
    if (!id) return setState({ loading: false, data: null });
    const res = await db.get(name, id);
    setState({ loading: false, data: res.data });
  }, [name, id]);
  useEffect(() => {
    reload();
  }, [reload]);
  return { ...state, reload };
};

// list filters survive navigation (edit page -> back to list)
export const useFilters = (key, defaults = {}) => {
  const [f, setF] = useState(() => {
    try {
      return { ...defaults, ...JSON.parse(sessionStorage.getItem(`filters:${key}`) || "{}") };
    } catch {
      return defaults;
    }
  });
  const set = (v) => {
    const next = Object.keys(v).length ? v : defaults;
    setF(next);
    try {
      sessionStorage.setItem(`filters:${key}`, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };
  return [f, set];
};

// lookup helper: label of a row in a master table
export const lookup = (tableName, id, field = "name") => {
  if (id === undefined || id === null || id === "") return "-";
  const r = db.getSync(tableName, id);
  return r ? r[field] ?? "-" : "-";
};

export const optionsOf = (tableName, labelField = "name", where) =>
  db.findSync(tableName, where).map((r) => ({
    label: typeof labelField === "function" ? labelField(r) : r[labelField],
    value: r.id,
  }));

// ---------------------------------------------------------------- alerts
export const alertSuccess = (title = "บันทึกข้อมูลเรียบร้อย") =>
  Swal.fire({ title, icon: "success", timer: 1500, showConfirmButton: false });

export const alertError = (title = "ข้อมูลผิดพลาด", text = "กรุณาตรวจสอบข้อมูลอีกครั้ง") =>
  Swal.fire({ title, text, icon: "error" });

export const confirmAction = async (title = "ยืนยันการทำรายการ ?", text = "", confirmButtonText = "ยืนยัน", color = "#0f766e") => {
  const r = await Swal.fire({
    title,
    text,
    icon: "question",
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText: "ยกเลิก",
    confirmButtonColor: color,
    cancelButtonColor: "#64748b",
  });
  return r.isConfirmed;
};

export const confirmDelete = (text = "ยืนยันการลบข้อมูล !!") =>
  confirmAction("ลบข้อมูล !!", text, "ใช่, ลบเลย", "#dc2626");

// ---------------------------------------------------------------- layout
export const Page = ({ title, subtitle, actions, children, breadcrumb }) => (
  <div className="space-y-4 p-4 lg:p-8">
    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div>
        {breadcrumb && (
          <div className="mb-1 flex flex-wrap items-center gap-1 text-xs text-slate-400">
            {breadcrumb.map((b, i) => (
              <React.Fragment key={i}>
                {i > 0 && <i className="pi pi-angle-right text-[10px]" />}
                <span>{b}</span>
              </React.Fragment>
            ))}
          </div>
        )}
        <div className="text-2xl font-bold tracking-tight text-slate-900">{title}</div>
        {subtitle && <div className="mt-1 text-sm text-slate-500">{subtitle}</div>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
    {children}
  </div>
);

export const Card = ({ title, icon, actions, children, className = "", bodyClass = "p-5" }) => (
  <div className={`overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm ${className}`}>
    {(title || actions) && (
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2 text-base font-semibold text-slate-800">
          {icon && <i className={`${icon} text-pink-600`} />}
          {title}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    )}
    <div className={bodyClass}>{children}</div>
  </div>
);

const TONES = {
  slate: "from-slate-800 to-slate-600",
  blue: "from-blue-600 to-indigo-600",
  emerald: "from-emerald-500 to-teal-600",
  pink: "from-pink-500 to-rose-600",
  amber: "from-amber-500 to-orange-600",
  violet: "from-violet-500 to-purple-600",
  cyan: "from-cyan-500 to-sky-600",
  red: "from-red-500 to-rose-700",
};

export const StatCard = ({ title, value, sub, icon, tone = "slate", onClick }) => (
  <div
    onClick={onClick}
    className={`rounded-3xl bg-gradient-to-br ${TONES[tone] || TONES.slate} p-5 text-white shadow-lg ${onClick ? "cursor-pointer hover:opacity-95" : ""}`}
  >
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="text-sm text-white/80">{title}</div>
        <div className="mt-2 truncate text-2xl font-bold">{value}</div>
        {sub && <div className="mt-1 text-xs text-white/70">{sub}</div>}
      </div>
      {icon && (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
          <i className={`${icon} text-xl`} />
        </div>
      )}
    </div>
  </div>
);

const BADGE = {
  gray: "bg-slate-100 text-slate-600",
  blue: "bg-blue-100 text-blue-700",
  green: "bg-emerald-100 text-emerald-700",
  yellow: "bg-amber-100 text-amber-700",
  red: "bg-rose-100 text-rose-700",
  violet: "bg-violet-100 text-violet-700",
  cyan: "bg-cyan-100 text-cyan-700",
  pink: "bg-pink-100 text-pink-700",
  orange: "bg-orange-100 text-orange-700",
};

export const Badge = ({ color = "gray", children, className = "" }) => (
  <span className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${BADGE[color] || BADGE.gray} ${className}`}>
    {children}
  </span>
);

// status map: { value: { label, color } }
export const StatusBadge = ({ map, value }) => {
  const s = map?.[value] || map?.[String(value)] || { label: value ?? "-", color: "gray" };
  return <Badge color={s.color}>{s.label}</Badge>;
};

export const Btn = ({ tone = "primary", className = "", ...props }) => {
  const style = {
    primary: { background: "linear-gradient(135deg,#ec4899 0%,#be185d 100%)", border: "none" },
    success: { background: "linear-gradient(135deg,#10b981 0%,#0f766e 100%)", border: "none" },
    info: { background: "linear-gradient(135deg,#3b82f6 0%,#4338ca 100%)", border: "none" },
    warning: { background: "linear-gradient(135deg,#f59e0b 0%,#ea580c 100%)", border: "none" },
    danger: { background: "linear-gradient(135deg,#ef4444 0%,#be123c 100%)", border: "none" },
  }[tone];
  return (
    <Button
      size="small"
      className={`rounded-xl px-4 ${className}`}
      style={style}
      outlined={tone === "outline"}
      severity={tone === "outline" ? "secondary" : undefined}
      {...props}
    />
  );
};

export const RowMenu = ({ items }) => {
  const ref = useRef(null);
  const model = items.filter(Boolean);
  return (
    <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
      <Button icon="pi pi-ellipsis-h" rounded text severity="secondary" onClick={(e) => ref.current?.toggle(e)} />
      <Menu model={model} popup ref={ref} popupAlignment="right" />
    </div>
  );
};

export const Info = ({ label, value, className = "" }) => (
  <div className={className}>
    <div className="text-xs text-slate-400">{label}</div>
    <div className="mt-0.5 break-words text-sm font-medium text-slate-800">{value ?? "-"}</div>
  </div>
);

export const Empty = ({ text = "ไม่พบข้อมูล" }) => (
  <div className="py-10 text-center text-sm text-slate-400">
    <i className="pi pi-inbox mb-2 block text-3xl" />
    {text}
  </div>
);

export const Progress = ({ value = 0, color = "#ec4899" }) => {
  const v = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full" style={{ width: `${v}%`, background: color }} />
      </div>
      <span className="w-12 text-right text-xs font-semibold text-slate-600">{v.toFixed(0)}%</span>
    </div>
  );
};

// ---------------------------------------------------------------- DataList
// columns: [{ field, header, type: 'date'|'money'|'index'|'status', map, body, style, sortable }]
export const DataList = ({
  value,
  columns,
  loading,
  title,
  subtitle,
  toolbar,
  searchFields,
  onRowClick,
  rows = 10,
  emptyMessage = "ไม่พบข้อมูล",
  footer,
  dataKey = "id",
  ...rest
}) => {
  const [search, setSearch] = useState("");
  const filters = useMemo(() => ({ global: { value: search || null, matchMode: FilterMatchMode.CONTAINS } }), [search]);

  const header = (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div>
        {title && <div className="text-lg font-semibold text-slate-900">{title}</div>}
        {subtitle && <div className="text-sm text-slate-500">{subtitle}</div>}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        {toolbar}
        <span className="relative">
          <i className="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <InputText
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหา..."
            className="h-10 w-full rounded-xl border-slate-200 bg-slate-50 pl-9 text-sm sm:w-64"
          />
        </span>
      </div>
    </div>
  );

  const renderBody = (c) => (row, opt) => {
    if (c.body) return c.body(row, opt);
    const v = row[c.field];
    switch (c.type) {
      case "index":
        return <span className="text-slate-500">{opt.rowIndex + 1}</span>;
      case "date":
        return <span className="whitespace-nowrap">{thDate(v)}</span>;
      case "money":
        return <div className="whitespace-nowrap text-right">{money(v)}</div>;
      case "status":
        return <StatusBadge map={c.map} value={v} />;
      default:
        return v ?? "-";
    }
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-2 shadow-sm">
      <DataTable
        value={value}
        loading={loading}
        header={header}
        size="small"
        paginator
        rows={rows}
        rowsPerPageOptions={[10, 25, 50, 100]}
        filters={filters}
        globalFilterFields={searchFields || columns.filter((c) => c.field).map((c) => c.field)}
        emptyMessage={emptyMessage}
        responsiveLayout="scroll"
        stripedRows
        dataKey={dataKey}
        selectionMode={onRowClick ? "single" : undefined}
        onRowSelect={onRowClick ? (e) => onRowClick(e.data) : undefined}
        footer={footer}
        className="text-sm"
        {...rest}
      >
        {columns.map((c, i) => (
          <Column
            key={i}
            field={c.field}
            header={c.header}
            sortable={c.sortable ?? (!!c.field && c.type !== "index")}
            body={renderBody(c)}
            style={c.style || (c.type === "index" ? { width: "4rem" } : undefined)}
            headerClassName={c.type === "money" ? "text-right" : undefined}
            footer={c.footer}
          />
        ))}
      </DataTable>
    </div>
  );
};

// ---------------------------------------------------------------- Form builder
// field: { name, label, type, options, source:{table,label,where}, required, col, placeholder, disabled, hidden(values), help, min, max }
const colClass = (col = 6) =>
  ({
    2: "md:col-span-2",
    3: "md:col-span-3",
    4: "md:col-span-4",
    5: "md:col-span-5",
    6: "md:col-span-6",
    8: "md:col-span-8",
    9: "md:col-span-9",
    12: "md:col-span-12",
  })[col] || "md:col-span-6";

export const FieldLabel = ({ label, required }) => (
  <label className="mb-1 block text-sm font-medium text-slate-700">
    {label}
    {required && <span className="ml-1 text-rose-500">*</span>}
  </label>
);

export const FieldInput = ({ field, value, onChange, values = {}, error }) => {
  const f = field;
  const cls = `w-full ${error ? "p-invalid" : ""}`;
  const opts =
    typeof f.options === "function"
      ? f.options(values)
      : f.options || (f.source ? optionsOf(f.source.table, f.source.label || "name", typeof f.source.where === "function" ? f.source.where(values) : f.source.where) : []);
  const disabled = typeof f.disabled === "function" ? f.disabled(values) : f.disabled;

  switch (f.type) {
    case "textarea":
      return <InputTextarea className={cls} rows={f.rows || 3} value={value ?? ""} disabled={disabled} placeholder={f.placeholder} onChange={(e) => onChange(e.target.value)} />;
    case "number":
      return (
        <InputNumber
          className={cls}
          inputClassName="w-full"
          value={value === "" || value === undefined ? null : Number(value)}
          disabled={disabled}
          useGrouping={false}
          min={f.min}
          max={f.max}
          minFractionDigits={f.decimals || 0}
          maxFractionDigits={f.decimals || 0}
          suffix={f.suffix}
          onValueChange={(e) => onChange(e.value)}
        />
      );
    case "money":
      return (
        <InputNumber
          className={cls}
          inputClassName="w-full text-right"
          value={value === "" || value === undefined ? null : Number(value)}
          disabled={disabled}
          minFractionDigits={2}
          maxFractionDigits={2}
          suffix=" บาท"
          onValueChange={(e) => onChange(e.value)}
        />
      );
    case "date":
      return (
        <Calendar
          className={cls}
          value={toDate(value)}
          disabled={disabled}
          dateFormat="dd/mm/yy"
          showIcon
          showButtonBar
          locale="th"
          onChange={(e) => onChange(isoDate(e.value))}
        />
      );
    case "select": {
      // PrimeReact treats "" as "no value"; map it to a sentinel so options like "ทั้งหมด" ("") display
      const EMPTY = "__empty__";
      const hasEmpty = opts.some((o) => o.value === "");
      const o2 = hasEmpty ? opts.map((o) => (o.value === "" ? { ...o, value: EMPTY } : o)) : opts;
      const v2 = hasEmpty && (value === "" || value === undefined || value === null) ? EMPTY : value ?? null;
      return (
        <Dropdown
          className={cls}
          value={v2}
          options={o2}
          disabled={disabled}
          filter={opts.length > 8}
          showClear={!f.required && !hasEmpty}
          placeholder={f.placeholder || "-- เลือก --"}
          onChange={(e) => onChange(e.value === EMPTY ? "" : e.value)}
        />
      );
    }
    case "multiselect":
      return (
        <MultiSelect
          className={cls}
          value={value || []}
          options={opts}
          disabled={disabled}
          filter
          display="chip"
          placeholder={f.placeholder || "-- เลือก --"}
          onChange={(e) => onChange(e.value)}
        />
      );
    case "radio":
      return (
        <div className="flex flex-wrap gap-4 pt-1">
          {opts.map((o) => (
            <label key={o.value} className="flex cursor-pointer items-center gap-2 text-sm">
              <RadioButton checked={String(value) === String(o.value)} disabled={disabled} onChange={() => onChange(o.value)} />
              {o.label}
            </label>
          ))}
        </div>
      );
    case "checkbox":
      return (
        <label className="flex cursor-pointer items-center gap-2 pt-1 text-sm">
          <Checkbox checked={!!value && value !== "0"} disabled={disabled} onChange={(e) => onChange(e.checked ? 1 : 0)} />
          {f.checkLabel || f.label}
        </label>
      );
    case "checkboxes":
      return (
        <div className="flex flex-wrap gap-4 pt-1">
          {opts.map((o) => {
            const arr = value || [];
            const on = arr.map(String).includes(String(o.value));
            return (
              <label key={o.value} className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox checked={on} disabled={disabled} onChange={() => onChange(on ? arr.filter((x) => String(x) !== String(o.value)) : [...arr, o.value])} />
                {o.label}
              </label>
            );
          })}
        </div>
      );
    case "file":
    case "files":
      return <FileInput multiple={f.type === "files"} value={value} accept={f.accept} disabled={disabled} onChange={onChange} />;
    case "image":
      return <FileInput image value={value} accept="image/*" disabled={disabled} onChange={onChange} />;
    case "richtext":
      return (
        <Editor
          value={value || ""}
          readOnly={disabled}
          style={{ height: f.height || 180 }}
          onTextChange={(e) => onChange(e.htmlValue || "")}
        />
      );
    case "html":
      return <div className="prose max-w-none rounded-lg bg-slate-50 px-3 py-2 text-sm" dangerouslySetInnerHTML={{ __html: value || "-" }} />;
    case "password":
      return <InputText type="password" className={cls} value={value ?? ""} disabled={disabled} onChange={(e) => onChange(e.target.value)} />;
    case "static":
      return <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">{f.render ? f.render(values) : value ?? "-"}</div>;
    default:
      return <InputText className={cls} value={value ?? ""} disabled={disabled} placeholder={f.placeholder} maxLength={f.maxLength} onChange={(e) => onChange(e.target.value)} />;
  }
};

export const FileInput = ({ value, onChange, multiple, image, accept, disabled }) => {
  const ref = useRef(null);
  const files = multiple ? value || [] : value ? [value] : [];
  const pick = async (e) => {
    const picked = await Promise.all([...e.target.files].map(fileToMock));
    onChange(multiple ? [...files, ...picked] : picked[0] || null);
    e.target.value = "";
  };
  return (
    <div className="space-y-2">
      <input ref={ref} type="file" className="hidden" multiple={multiple} accept={accept} onChange={pick} />
      {!disabled && <Button type="button" size="small" outlined icon="pi pi-upload" label="เลือกไฟล์" onClick={() => ref.current?.click()} />}
      {image && files[0]?.url && <img src={files[0].url} alt="" className="h-32 rounded-xl border object-cover" />}
      {files.length > 0 && (
        <ul className="space-y-1">
          {files.map((f, i) => (
            <li key={i} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-1.5 text-sm">
              <i className="pi pi-paperclip text-slate-400" />
              {f.url ? (
                <a href={f.url} download={f.name} target="_blank" className="flex-1 truncate text-blue-600 hover:underline">
                  {f.name}
                </a>
              ) : (
                <span className="flex-1 truncate">{f.name}</span>
              )}
              {!disabled && (
                <button type="button" className="text-rose-500" onClick={() => onChange(multiple ? files.filter((_, j) => j !== i) : null)}>
                  <i className="pi pi-times" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export const FileLinks = ({ files }) => {
  const arr = Array.isArray(files) ? files : files ? [files] : [];
  if (!arr.length) return <span className="text-slate-400">-</span>;
  return (
    <div className="flex flex-col gap-1">
      {arr.map((f, i) =>
        f.url ? (
          <a key={i} href={f.url} download={f.name} target="_blank" className="truncate text-sm text-blue-600 hover:underline">
            <i className="pi pi-file mr-1" />
            {f.name}
          </a>
        ) : (
          <span key={i} className="truncate text-sm text-slate-600">
            <i className="pi pi-file mr-1" />
            {f.name}
          </span>
        ),
      )}
    </div>
  );
};

// sections: [{ title, icon, fields: [...] }] or fields: [...]
export const FormBuilder = ({ sections, fields, values, setValues, errors = {} }) => {
  const groups = sections || [{ fields }];
  const set = (name, v) => setValues((prev) => ({ ...prev, [name]: v }));
  return (
    <div className="space-y-5">
      {groups.map((g, gi) => (
        <div key={gi} className={g.title ? "rounded-2xl border border-slate-100 bg-slate-50/40 p-4" : ""}>
          {g.title && (
            <div className="mb-4 flex items-center gap-2 border-b border-slate-200 pb-2 text-sm font-semibold text-pink-700">
              {g.icon && <i className={g.icon} />}
              {g.title}
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
            {g.fields
              .filter((f) => !(typeof f.hidden === "function" ? f.hidden(values) : f.hidden))
              .map((f) =>
                f.type === "divider" ? (
                  <div key={f.name || f.label} className="md:col-span-12 border-t border-dashed border-slate-200 pt-2 text-sm font-semibold text-slate-600">
                    {f.label}
                  </div>
                ) : (
                  <div key={f.name} className={colClass(f.col)}>
                    {f.type !== "checkbox" && <FieldLabel label={f.label} required={f.required} />}
                    <FieldInput field={f} value={values[f.name]} values={values} error={errors[f.name]} onChange={(v) => set(f.name, f.onChange ? f.onChange(v, values, setValues) ?? v : v)} />
                    {f.help && <div className="mt-1 text-xs text-slate-400">{f.help}</div>}
                    {errors[f.name] && <div className="mt-1 text-xs text-rose-500">{errors[f.name]}</div>}
                  </div>
                ),
              )}
          </div>
        </div>
      ))}
    </div>
  );
};

export const validate = (fieldsOrSections, values) => {
  const all = fieldsOrSections.flatMap((x) => x.fields || [x]);
  const errors = {};
  all.forEach((f) => {
    const hidden = typeof f.hidden === "function" ? f.hidden(values) : f.hidden;
    if (!f.required || hidden) return;
    const v = values[f.name];
    if (v === undefined || v === null || v === "" || (Array.isArray(v) && !v.length)) errors[f.name] = f.msg || `กรุณาระบุ${f.label}`;
  });
  return errors;
};

export const defaultsOf = (fieldsOrSections) => {
  const all = fieldsOrSections.flatMap((x) => x.fields || [x]);
  return Object.fromEntries(all.filter((f) => f.name && f.default !== undefined).map((f) => [f.name, typeof f.default === "function" ? f.default() : f.default]));
};

// generic modal/page form wrapper: returns [values, setValues, errors, submit]
export const useForm = (schema, initial) => {
  const [values, setValues] = useState(() => ({ ...defaultsOf(schema), ...(initial || {}) }));
  const [errors, setErrors] = useState({});
  useEffect(() => {
    if (initial) setValues((v) => ({ ...v, ...initial }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(initial)]);
  const check = () => {
    const e = validate(schema, values);
    setErrors(e);
    if (Object.keys(e).length) {
      alertError("กรอกข้อมูลไม่ครบ", Object.values(e).slice(0, 5).join("\n"));
      return false;
    }
    return true;
  };
  return { values, setValues, errors, check };
};

// ---------------------------------------------------------------- Excel export
export const exportExcel = async (filename, columns, rows, title) => {
  const ExcelJS = (await import("exceljs")).default;
  const { saveAs } = await import("file-saver");
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Sheet1");
  let start = 1;
  if (title) {
    ws.addRow([title]);
    ws.mergeCells(1, 1, 1, columns.length);
    ws.getRow(1).font = { bold: true, size: 14 };
    ws.getRow(1).alignment = { horizontal: "center" };
    start = 2;
  }
  ws.addRow(columns.map((c) => c.header));
  ws.getRow(start).font = { bold: true };
  ws.getRow(start).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFCE7F3" } };
  rows.forEach((r, i) =>
    ws.addRow(
      columns.map((c) => {
        if (c.value) return c.value(r, i);
        if (c.type === "index") return i + 1;
        if (c.type === "date") return thDate(r[c.field]);
        if (c.type === "money") return Number(r[c.field]) || 0;
        return r[c.field] ?? "";
      }),
    ),
  );
  columns.forEach((c, i) => {
    ws.getColumn(i + 1).width = c.width || Math.max(12, String(c.header).length + 4);
    if (c.type === "money") ws.getColumn(i + 1).numFmt = "#,##0.00";
  });
  const buf = await wb.xlsx.writeBuffer();
  saveAs(new Blob([buf]), filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`);
};

export const ExcelButton = ({ filename, columns, rows, title, label = "Export Excel" }) => (
  <Button size="small" icon="pi pi-file-excel" label={label} severity="success" outlined className="rounded-xl" onClick={() => exportExcel(filename, columns, rows, title)} />
);
