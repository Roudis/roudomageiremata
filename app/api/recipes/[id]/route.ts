import { NextRequest, NextResponse } from "next/server";
import { deleteRecipe, getRecipeById, updateRecipe } from "@/lib/recipes";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const recipe = await getRecipeById(params.id);

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found." }, { status: 404 });
    }

    return NextResponse.json({ recipe });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to load recipe." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const body = await request.json();
    const recipe = await updateRecipe(params.id, body);

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found." }, { status: 404 });
    }

    return NextResponse.json({ recipe });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Unable to update recipe.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const recipe = await deleteRecipe(params.id);

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found." }, { status: 404 });
    }

    return NextResponse.json({ recipe });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to delete recipe." }, { status: 500 });
  }
}
