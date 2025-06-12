'use client';

import { ReactNode } from 'react';
import { Grid, SemanticWIDTHS } from 'semantic-ui-react';

interface CardGroupProps {
  children?: ReactNode;
  itemsPerRow?: SemanticWIDTHS;
  doubling?: boolean;
  stackable?: boolean;
  style?: React.CSSProperties;
}

export default function CardGroup({
  children,
  itemsPerRow = 4,
  doubling = false,
  stackable = false,
  style,
}: CardGroupProps) {
  return (
    <Grid
      columns={itemsPerRow}
      doubling={doubling}
      stackable={stackable}
      container
      style={style}
    >
      {Array.isArray(children)
        ? children.map((child, index) => (
            <Grid.Column key={index}>{child}</Grid.Column>
          ))
        : children && <Grid.Column>{children}</Grid.Column>}
    </Grid>
  );
}
