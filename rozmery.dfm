object Form2: TForm2
  Left = 328
  Top = 235
  Width = 277
  Height = 140
  Caption = 'Zadej rozmer'
  Color = clBtnFace
  Font.Charset = DEFAULT_CHARSET
  Font.Color = clWindowText
  Font.Height = -11
  Font.Name = 'MS Sans Serif'
  Font.Style = []
  OldCreateOrder = False
  OnCreate = FormCreate
  PixelsPerInch = 96
  TextHeight = 13
  object Label1: TLabel
    Left = 24
    Top = 24
    Width = 61
    Height = 13
    Alignment = taCenter
    BiDiMode = bdLeftToRight
    Caption = 'Zadej rozmer'
    ParentBiDiMode = False
    Layout = tlCenter
  end
  object rozmerEdit: TSpinEdit
    Left = 120
    Top = 24
    Width = 89
    Height = 22
    MaxValue = 50
    MinValue = 4
    TabOrder = 0
    Value = 4
    OnKeyDown = rozmerEditKeyDown
  end
  object okbtn: TBitBtn
    Left = 32
    Top = 72
    Width = 81
    Height = 25
    TabOrder = 1
    Kind = bkOK
  end
  object cancelbtn: TBitBtn
    Left = 152
    Top = 72
    Width = 81
    Height = 25
    TabOrder = 2
    Kind = bkCancel
  end
  object Button1: TButton
    Left = 192
    Top = 88
    Width = 25
    Height = 1
    Caption = 'Button1'
    TabOrder = 3
  end
end
