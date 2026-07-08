import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { CATEGORIAS_INSUMO, CategoriaInsumo } from '@models/insumo';
import { MAQUINA_SIN_ESPECIFICAR } from '@models/maquina';
import { OpcionSelect } from '@models/opcion-select';
import { InventarioService } from '@services/inventario.service';
import { DetalleInventarioService } from '@services/detalle-inventario.service';
import { MaquinaService } from '@services/maquina.service';
import { InsumoService } from '@services/insumo.service';
import { ahoraParaInputLocal, isoAInputDatetimeLocal } from '@shared/fecha';

type TipoItem = 'maquina' | 'insumo';

@Component({
  selector: 'app-detalle-inventario-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './detalle-inventario-form.html',
})
export class DetalleInventarioForm {
  private readonly fb = inject(FormBuilder);
  private readonly detalleService = inject(DetalleInventarioService);
  private readonly inventarioService = inject(InventarioService);
  private readonly maquinaService = inject(MaquinaService);
  private readonly insumoService = inject(InsumoService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly idInventario = Number(this.route.snapshot.paramMap.get('idInventario'));
  private readonly idEditando = this.route.snapshot.paramMap.get('id');

  protected readonly editando = this.idEditando !== null;
  protected readonly guardando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly cargandoOpciones = signal(true);
  protected readonly cargandoRegistro = signal(this.editando);

  protected readonly etiquetaInventario = signal('');
  protected readonly maquinas = signal<OpcionSelect[]>([]);
  protected readonly insumos = signal<OpcionSelect[]>([]);

  /** Controla qué select se muestra (máquina o insumo); refuerza en el
   *  cliente la regla "uno u otro" que el backend no valida. No vive en el
   *  FormGroup para que conmutar la vista sea instantáneo vía signal. */
  protected readonly tipoItem = signal<TipoItem>('maquina');

  /** Alta inline: evita mandar al usuario al módulo de Máquinas/Insumos solo para crear uno nuevo. */
  protected readonly categoriasInsumo = CATEGORIAS_INSUMO;
  protected readonly mostrandoFormMaquina = signal(false);
  protected readonly mostrandoFormInsumo = signal(false);
  protected readonly guardandoItemNuevo = signal(false);

  protected readonly formularioMaquinaNueva = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    marca: [''],
    nro_serie: [''],
  });

  protected readonly formularioInsumoNuevo = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    categoria: ['cocina' as CategoriaInsumo, Validators.required],
    medida: [''],
  });

  protected readonly formulario = this.fb.nonNullable.group({
    maquina: [''],
    insumo: [''],
    cantidad: ['', Validators.required],
    fecha_adquision: ['', Validators.required],
    fecha_fin: [''],
    ubicacion: ['', Validators.required],
    descripcion: ['', Validators.required],
    observacion: ['', Validators.required],
    estado: ['', Validators.required],
  });

  constructor() {
    this.inventarioService.getById(this.idInventario).subscribe({
      next: (inventario) => this.etiquetaInventario.set(`Inventario #${inventario.id} — ${inventario.lugar}`),
      error: () => this.etiquetaInventario.set(`Inventario #${this.idInventario}`),
    });

    this.cargarOpciones();

    if (this.idEditando !== null) {
      this.detalleService.getById(Number(this.idEditando)).subscribe({
        next: (detalle) => {
          this.tipoItem.set(detalle.maquina !== null ? 'maquina' : 'insumo');
          this.formulario.patchValue({
            maquina: detalle.maquina !== null ? String(detalle.maquina) : '',
            insumo: detalle.insumo !== null ? String(detalle.insumo) : '',
            cantidad: detalle.cantidad,
            fecha_adquision: isoAInputDatetimeLocal(detalle.fecha_adquision),
            fecha_fin: detalle.fecha_fin ? isoAInputDatetimeLocal(detalle.fecha_fin) : '',
            ubicacion: detalle.ubicacion,
            descripcion: detalle.descripcion,
            observacion: detalle.observacion,
            estado: detalle.estado,
          });
          this.cargandoRegistro.set(false);
        },
        error: () => {
          this.error.set('No se pudo cargar el detalle a editar.');
          this.cargandoRegistro.set(false);
        },
      });
    }
  }

  protected seleccionarTipo(tipo: TipoItem): void {
    this.tipoItem.set(tipo);
  }

  protected establecerFechaAdquisionAhora(): void {
    this.formulario.controls.fecha_adquision.setValue(ahoraParaInputLocal());
  }

  protected establecerFechaFinAhora(): void {
    this.formulario.controls.fecha_fin.setValue(ahoraParaInputLocal());
  }

  protected mostrarFormMaquina(): void {
    this.mostrandoFormMaquina.set(true);
  }

  protected cancelarFormMaquina(): void {
    this.mostrandoFormMaquina.set(false);
    this.formularioMaquinaNueva.reset({ nombre: '', marca: '', nro_serie: '' });
  }

  protected guardarNuevaMaquina(): void {
    if (this.formularioMaquinaNueva.invalid) {
      this.formularioMaquinaNueva.markAllAsTouched();
      return;
    }

    const valores = this.formularioMaquinaNueva.getRawValue();
    this.guardandoItemNuevo.set(true);

    this.maquinaService
      .create({
        nombre: valores.nombre,
        marca: valores.marca || MAQUINA_SIN_ESPECIFICAR,
        nro_serie: valores.nro_serie || MAQUINA_SIN_ESPECIFICAR,
      })
      .subscribe({
        next: (nueva) => {
          this.maquinas.update((lista) => [...lista, { id: nueva.id, label: nueva.nombre }]);
          this.formulario.controls.maquina.setValue(String(nueva.id));
          this.guardandoItemNuevo.set(false);
          this.cancelarFormMaquina();
        },
        error: () => {
          this.error.set('No se pudo crear la máquina.');
          this.guardandoItemNuevo.set(false);
        },
      });
  }

  protected mostrarFormInsumo(): void {
    this.mostrandoFormInsumo.set(true);
  }

  protected cancelarFormInsumo(): void {
    this.mostrandoFormInsumo.set(false);
    this.formularioInsumoNuevo.reset({ nombre: '', categoria: 'cocina', medida: '' });
  }

  protected guardarNuevoInsumo(): void {
    if (this.formularioInsumoNuevo.invalid) {
      this.formularioInsumoNuevo.markAllAsTouched();
      return;
    }

    const valores = this.formularioInsumoNuevo.getRawValue();
    this.guardandoItemNuevo.set(true);

    this.insumoService
      .create({ nombre: valores.nombre, categoria: valores.categoria, medida: valores.medida || null })
      .subscribe({
        next: (nuevo) => {
          this.insumos.update((lista) => [...lista, { id: nuevo.id, label: `${nuevo.nombre} (${nuevo.categoria})` }]);
          this.formulario.controls.insumo.setValue(String(nuevo.id));
          this.guardandoItemNuevo.set(false);
          this.cancelarFormInsumo();
        },
        error: () => {
          this.error.set('No se pudo crear el insumo.');
          this.guardandoItemNuevo.set(false);
        },
      });
  }

  protected guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const valores = this.formulario.getRawValue();
    const esMaquina = this.tipoItem() === 'maquina';

    if (esMaquina && !valores.maquina) {
      this.error.set('Selecciona una máquina.');
      return;
    }
    if (!esMaquina && !valores.insumo) {
      this.error.set('Selecciona un insumo.');
      return;
    }

    this.guardando.set(true);
    this.error.set(null);

    const payload = {
      inventario: this.idInventario,
      maquina: esMaquina ? Number(valores.maquina) : null,
      insumo: esMaquina ? null : Number(valores.insumo),
      cantidad: valores.cantidad,
      fecha_adquision: new Date(valores.fecha_adquision).toISOString(),
      fecha_fin: valores.fecha_fin ? new Date(valores.fecha_fin).toISOString() : null,
      ubicacion: valores.ubicacion,
      descripcion: valores.descripcion,
      observacion: valores.observacion,
      estado: valores.estado,
    };

    const peticion = this.idEditando
      ? this.detalleService.update(Number(this.idEditando), payload)
      : this.detalleService.create(payload);

    peticion.subscribe({
      next: () => this.router.navigate(['/inventarios', this.idInventario, 'detalles']),
      error: () => {
        this.error.set('No se pudo guardar el detalle. Verifica los datos e intenta de nuevo.');
        this.guardando.set(false);
      },
    });
  }

  private cargarOpciones(): void {
    forkJoin({
      maquinas: this.maquinaService.listConLabel(),
      insumos: this.insumoService.listConLabel(),
    }).subscribe({
      next: ({ maquinas, insumos }) => {
        this.maquinas.set(maquinas);
        this.insumos.set(insumos);
        this.cargandoOpciones.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los datos del formulario.');
        this.cargandoOpciones.set(false);
      },
    });
  }
}
